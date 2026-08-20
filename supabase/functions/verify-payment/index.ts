import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { hmac } from 'https://deno.land/x/crypto@v0.10.0/hmac.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature, eatnakedOrderId, deliveryLocation, cartItems } = await req.json()

    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET')
    if (!razorpaySecret) throw new Error('Razorpay configuration missing')

    // 1. Verify Signature
    const body = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = hmac('sha256', razorpaySecret, body, 'utf8', 'hex')

    if (expectedSignature !== razorpaySignature) {
      throw new Error('Invalid payment signature')
    }

    // 2. Setup Admin Supabase Client (to bypass RLS for inserting orders securely)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. Create Order
    // In a real scenario we'd first ensure the order hasn't been created yet (idempotency)
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        id: eatnakedOrderId,
        status: 'PENDING',
        payment_status: 'CAPTURED',
        delivery_location: deliveryLocation,
        items: cartItems, // Snapshot of items
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId
      })
      .select()
      .single()

    // 4. Create Payments Record
    await supabaseAdmin
      .from('payments')
      .insert({
        order_id: eatnakedOrderId,
        provider: 'razorpay',
        provider_order_id: razorpayOrderId,
        provider_payment_id: razorpayPaymentId,
        status: 'CAPTURED'
      })

    return new Response(
      JSON.stringify({ success: true, orderId: eatnakedOrderId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
