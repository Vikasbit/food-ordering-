import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Types and cors headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { cartItems, restaurantId, couponCode, userId, paymentMethod } = await req.json()

    // 1. Authenticate user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user || user.id !== userId) {
      throw new Error('Unauthorized')
    }

    // 2. Fetch Restaurant
    const { data: restaurant, error: restError } = await supabaseClient
      .from('restaurants')
      .select('*, menu_categories(*, menu_items(*))')
      .eq('id', restaurantId)
      .single()

    if (restError || !restaurant) throw new Error('Restaurant not found')
    if (restaurant.status !== 'active') throw new Error('Restaurant is unavailable')

    // 3. Flatten valid items
    const validItems = []
    restaurant.menu_categories.forEach(cat => {
      cat.menu_items.forEach(item => validItems.push(item))
    })

    // 4. Calculate authoritative price
    let subtotal = 0
    for (const item of cartItems) {
      const dbItem = validItems.find(i => i.id === item.id)
      if (!dbItem) throw new Error(`Item ${item.id} not found`)
      if (!dbItem.is_available) throw new Error(`Item ${item.id} unavailable`)
      subtotal += (dbItem.price * item.quantity)
    }

    // 5. Apply Coupon
    let discount = 0
    if (couponCode) {
      const code = couponCode.trim().toUpperCase()
      if (code === 'EAT50') {
        discount = subtotal * 0.5
      } else {
        throw new Error('Invalid coupon')
      }
    }

    const deliveryFee = 40
    const tax = Math.round((subtotal - discount) * 0.05)
    const finalAmount = (subtotal - discount) + deliveryFee + tax

    // 6. Generate Razorpay Order
    // Validate paymentMethod
    const pm = (paymentMethod || 'UPI').toUpperCase()
    if (!['UPI', 'COD'].includes(pm)) {
      throw new Error('Invalid payment method')
    }

    // Generate BIGBITES order ID
    const bigbitesOrderId = `EAT${Date.now()}`

    // Insert order with pending status into Supabase
    const { error: insertError } = await supabaseClient.from('orders').insert({
      id: bigbitesOrderId,
      user_id: user.id,
      restaurant_id: restaurant.id,
      status: 'PENDING',
      payment_method: pm,
      payment_status: pm === 'COD' ? 'PENDING' : 'PENDING',
      amount: finalAmount,
      subtotal: subtotal,
      discount: discount,
      delivery_fee: deliveryFee,
      tax: tax,
    })
    if (insertError) {
      throw new Error('Failed to create order')
    }

    if (pm === 'COD') {
      // COD flow – no Razorpay order
      return new Response(
        JSON.stringify({
          orderId: bigbitesOrderId,
          paymentMethod: 'COD',
          paymentStatus: 'PENDING'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // UPI flow – create Razorpay order
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpayKeyId || !razorpaySecret) {
      throw new Error('Razorpay configuration missing')
    }

    const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${razorpayKeyId}:${razorpaySecret}`)
      },
      body: JSON.stringify({
        amount: finalAmount * 100,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`
      })
    })
    const rzpOrder = await rzpResponse.json()
    if (!rzpOrder.id) {
      throw new Error('Failed to create Razorpay Order')
    }

    // Update order with Razorpay reference
    const { error: updateError } = await supabaseClient.from('orders').update({ razorpay_order_id: rzpOrder.id }).eq('id', bigbitesOrderId)
    if (updateError) {
      throw new Error('Failed to link Razorpay order')
    }

    return new Response(
      JSON.stringify({
        razorpayKeyId,
        amount: finalAmount * 100,
        currency: 'INR',
        razorpayOrderId: rzpOrder.id,
        bigbitesOrderId,
        paymentMethod: 'UPI'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
