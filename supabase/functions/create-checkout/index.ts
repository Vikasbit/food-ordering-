import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { cartItems = [], restaurantId, couponCode, userId, paymentMethod = 'UPI' } = await req.json()

    if (!restaurantId || !userId || !Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error('Restaurant, user and cart items are required')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user || user.id !== userId) throw new Error('Unauthorized')

    const { data: restaurant, error: restError } = await supabaseClient
      .from('restaurants')
      .select('*, menu_categories(*, menu_items(*))')
      .eq('id', restaurantId)
      .single()

    if (restError || !restaurant) throw new Error('Restaurant not found')
    if (String(restaurant.status).toLowerCase() !== 'active') throw new Error('Restaurant is unavailable')

    const validItems = (restaurant.menu_categories ?? []).flatMap((category: any) => category.menu_items ?? [])
    const orderItems: any[] = []
    let subtotal = 0

    for (const cartItem of cartItems) {
      const quantity = Number(cartItem.quantity)
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
        throw new Error('Invalid item quantity')
      }

      const dbItem = validItems.find((item: any) => item.id === cartItem.id)
      if (!dbItem) throw new Error(`Item ${cartItem.id} not found`)
      if (!dbItem.is_available) throw new Error(`${dbItem.name} is unavailable`)

      const price = Number(dbItem.price)
      if (!Number.isFinite(price) || price < 0) throw new Error(`Invalid price for ${dbItem.name}`)

      subtotal += price * quantity
      orderItems.push({
        id: dbItem.id,
        name: dbItem.name,
        quantity,
        price,
        image_url: dbItem.image_url ?? null,
      })
    }

    subtotal = Math.round(subtotal * 100) / 100

    // Apply Coupon
    let discount = 0
    const normalizedCoupon = String(couponCode ?? '').trim().toUpperCase()
    if (normalizedCoupon) {
      if (normalizedCoupon !== 'EAT50' && normalizedCoupon !== 'BIGBITES50') {
        throw new Error('Invalid coupon code. Use EAT50 for 50% off.')
      }
      discount = Math.round(subtotal * 0.5 * 100) / 100
    }

    // Delivery fee: Free above ₹499, otherwise ₹39
    const deliveryFee = subtotal > 499 ? 0 : 39
    const taxableAmount = Math.max(0, subtotal - discount)
    const tax = Math.round(taxableAmount * 0.05)
    const finalAmountRupees = Math.max(0, Math.round(taxableAmount + deliveryFee + tax))

    const pm = String(paymentMethod).toUpperCase()
    if (!['UPI', 'COD'].includes(pm)) throw new Error('Invalid payment method')

    const bigbitesOrderId = `EAT${Date.now()}${Math.floor(Math.random() * 1000)}`

    const { error: insertError } = await supabaseClient.from('orders').insert({
      id: bigbitesOrderId,
      user_id: user.id,
      restaurant_id: restaurant.id,
      status: 'PENDING',
      payment_method: pm,
      payment_status: 'PENDING',
      amount: finalAmountRupees,
      subtotal,
      discount,
      delivery_fee: deliveryFee,
      tax,
      coupon_code: normalizedCoupon || null,
      items: orderItems,
    })

    if (insertError) throw new Error(`Failed to create order: ${insertError.message}`)

    if (pm === 'COD') {
      return json({
        orderId: bigbitesOrderId,
        bigbitesOrderId,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
      })
    }

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpayKeyId || !razorpaySecret) throw new Error('Razorpay configuration missing on Supabase')

    const credentials = btoa(`${razorpayKeyId}:${razorpaySecret}`)
    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: finalAmountRupees * 100,
        currency: 'INR',
        receipt: bigbitesOrderId,
        notes: { bigbites_order_id: bigbitesOrderId },
      }),
    })

    const rzpBody = await rzpResponse.json()
    if (!rzpResponse.ok || !rzpBody?.id) {
      const message = rzpBody?.error?.description || rzpBody?.error?.reason || 'Razorpay order creation failed'
      throw new Error(message)
    }

    const { error: updateError } = await supabaseClient
      .from('orders')
      .update({ razorpay_order_id: rzpBody.id })
      .eq('id', bigbitesOrderId)

    if (updateError) throw new Error(`Failed to link Razorpay order: ${updateError.message}`)

    return json({
      razorpayKeyId,
      amount: finalAmountRupees * 100,
      currency: 'INR',
      razorpayOrderId: rzpBody.id,
      bigbitesOrderId,
      paymentMethod: 'UPI',
    })
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'Checkout failed' }, 400)
  }
})
