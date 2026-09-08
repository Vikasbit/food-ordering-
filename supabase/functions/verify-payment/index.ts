import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hmac } from 'https://deno.land/x/crypto@v0.10.0/hmac.ts'

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
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, bigbitesOrderId, deliveryLocation } = await req.json()
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature || !bigbitesOrderId) {
      throw new Error('Missing payment verification fields')
    }

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )
    const { data: { user } } = await supabaseUser.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID')
    if (!serviceRoleKey || !razorpaySecret || !razorpayKeyId) throw new Error('Payment verification configuration missing')

    const supabaseAdmin = createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceRoleKey)

    // create-checkout already created this order. Load and update it; never insert a second order.
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders').select('*').eq('id', bigbitesOrderId).single()
    if (orderError || !order) throw new Error('BIGBITES order not found')
    if (order.user_id !== user.id) throw new Error('Order does not belong to the authenticated user')
    if (order.payment_method !== 'UPI') throw new Error('This order is not a UPI order')
    if (order.razorpay_order_id !== razorpayOrderId) throw new Error('Razorpay order mismatch')

    // Verify against the Razorpay order ID stored on the server, not a browser-supplied order ID.
    const expectedSignature = hmac('sha256', razorpaySecret, `${order.razorpay_order_id}|${razorpayPaymentId}`, 'utf8', 'hex')
    if (expectedSignature !== razorpaySignature) throw new Error('Invalid payment signature')

    // Confirm payment status, amount and currency directly with Razorpay.
    const credentials = btoa(`${razorpayKeyId}:${razorpaySecret}`)
    const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpayPaymentId)}`, {
      headers: { Authorization: `Basic ${credentials}` },
    })
    const payment = await paymentResponse.json()
    if (!paymentResponse.ok || !payment?.id) throw new Error(payment?.error?.description || 'Unable to fetch Razorpay payment')
    if (payment.order_id !== order.razorpay_order_id) throw new Error('Payment does not belong to this Razorpay order')
    if (payment.currency !== 'INR') throw new Error('Unexpected payment currency')
    if (Number(payment.amount) !== Math.round(Number(order.amount) * 100)) throw new Error('Payment amount mismatch')
    if (!['captured', 'authorized'].includes(String(payment.status).toLowerCase())) throw new Error(`Payment is not successful: ${payment.status}`)

    const delivAddress = deliveryLocation?.address || deliveryLocation?.formatted_address || null
    const delivLat = deliveryLocation?.latitude ?? deliveryLocation?.lat ?? null
    const delivLng = deliveryLocation?.longitude ?? deliveryLocation?.lng ?? null
    const updatePayload: Record<string, unknown> = {
      payment_status: String(payment.status).toUpperCase(),
      razorpay_payment_id: razorpayPaymentId,
      status: 'PENDING',
    }
    if (delivAddress) updatePayload.delivery_address = delivAddress
    if (delivLat !== null) updatePayload.delivery_latitude = delivLat
    if (delivLng !== null) updatePayload.delivery_longitude = delivLng
    if (delivAddress || delivLat !== null || delivLng !== null) {
      updatePayload.delivery_location = { address: delivAddress, lat: delivLat, lng: delivLng, label: deliveryLocation?.label || 'HOME' }
    }

    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders').update(updatePayload).eq('id', bigbitesOrderId).select().single()
    if (updateError || !updatedOrder) throw new Error(`Failed to update order: ${updateError?.message || 'unknown error'}`)

    // Idempotent payment record: callback retries will not create duplicates.
    const { data: existingPayment } = await supabaseAdmin
      .from('payments').select('id').eq('provider', 'razorpay').eq('provider_payment_id', razorpayPaymentId).maybeSingle()
    if (!existingPayment) {
      const { error: paymentInsertError } = await supabaseAdmin.from('payments').insert({
        order_id: bigbitesOrderId,
        provider: 'razorpay',
        provider_order_id: razorpayOrderId,
        provider_payment_id: razorpayPaymentId,
        status: String(payment.status).toUpperCase(),
        amount: payment.amount,
        currency: payment.currency,
      })
      if (paymentInsertError) throw new Error(`Failed to save payment: ${paymentInsertError.message}`)
    }

    return json({ success: true, orderId: bigbitesOrderId, paymentStatus: String(payment.status).toUpperCase() })
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : 'Payment verification failed' }, 400)
  }
})
