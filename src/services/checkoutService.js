import { marketplaceService, isSupabaseConfigured, supabase } from '../lib/supabase';

// This file simulates a secure backend specifically for local testing without Supabase Edge Functions.
// If isSupabaseConfigured is true, it routes the request to the real Supabase Edge Function.
// If false, it acts as a robust mock backend to calculate prices authoritatively.

export const checkoutService = {
  
  /**
   * BACKEND SIMULATION: Create a Razorpay Order
   * 1. Re-fetches the active restaurant to ensure it's ACTIVE.
   * 2. Re-fetches all menu items to calculate true prices, ignoring frontend prices.
   * 3. Calculates strictly (Food Subtotal - Coupon) + Delivery + Tax.
   * 4. Returns a mock Razorpay order ID to initialize the checkout modal.
   */
  async createRazorpayOrder({ cartItems, restaurantId, couponCode, userId }) {
    if (isSupabaseConfigured) {
      // Call actual Edge Function
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { cartItems, restaurantId, couponCode, userId }
      });
      if (error) throw error;
      return data;
    }

    // --- MOCK BACKEND LOGIC BELOW ---
    console.log('[MOCK BACKEND] Validating checkout...');
    
    const allRestaurants = JSON.parse(localStorage.getItem('eatnaked_db_restaurants') || '[]');
    const restaurant = allRestaurants.find(r => r.id === restaurantId);
    
    if (!restaurant) throw new Error('Restaurant not found.');
    if (restaurant.status !== 'ACTIVE') throw new Error('This restaurant is currently unavailable.');
    
    // Flat map all items from all categories for easy lookup
    const allValidItems = (restaurant.categories || []).flatMap(cat => cat.items || []);

    let authoritativeSubtotal = 0;
    
    // Validate each cart item against the database
    for (const item of cartItems) {
      const dbItem = allValidItems.find(i => i.id === item.id);
      if (!dbItem) throw new Error(`Menu item not found: ${item.id}`);
      if (!dbItem.is_available) throw new Error(`${dbItem.name} is currently unavailable.`);
      
      // Use strictly database price, ignore frontend price
      authoritativeSubtotal += (dbItem.price * item.quantity);
    }
    
    let discount = 0;
    if (couponCode) {
      const code = couponCode.trim().toUpperCase();
      // Hardcoded validation for MVP requirement "EAT50"
      if (code === 'EAT50') {
        discount = authoritativeSubtotal * 0.5; // 50% off food subtotal
      } else {
        throw new Error('Invalid coupon code.');
      }
    }
    
    const deliveryFee = 40;
    const tax = Math.round((authoritativeSubtotal - discount) * 0.05); // 5% tax
    
    const finalAmount = (authoritativeSubtotal - discount) + deliveryFee + tax;
    
    // Normally we would call Razorpay API here via HTTP to get a real rzp_order_id.
    // For local test mode, we generate a fake one.
    const mockRazorpayOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;
    const mockEatnakedOrderId = `EAT${Date.now()}`;
    
    console.log('[MOCK BACKEND] Final strict calculation:', {
      subtotal: authoritativeSubtotal,
      discount,
      deliveryFee,
      tax,
      finalAmount
    });
    
    // Save pending snapshot to localStorage to simulate a pending order record
    const pendingOrder = {
      id: mockEatnakedOrderId,
      customer_id: userId,
      restaurant_id: restaurantId,
      status: 'PAYMENT_PENDING',
      amount: finalAmount,
      subtotal: authoritativeSubtotal,
      discount_amount: discount,
      delivery_fee: deliveryFee,
      tax_amount: tax,
      coupon_code: couponCode,
      created_at: new Date().toISOString()
    };
    
    const orders = JSON.parse(localStorage.getItem('eatnaked_db_orders') || '[]');
    orders.push(pendingOrder);
    localStorage.setItem('eatnaked_db_orders', JSON.stringify(orders));

    // Wait a bit to simulate network
    await new Promise(r => setTimeout(r, 800));

    return {
      razorpayKeyId: 'rzp_test_mockkey123', // Dummy key for frontend load
      amount: finalAmount * 100, // Razorpay expects paise (amount * 100)
      currency: 'INR',
      razorpayOrderId: mockRazorpayOrderId,
      eatnakedOrderId: mockEatnakedOrderId
    };
  },
  
  /**
   * BACKEND SIMULATION: Verify Razorpay Payment
   * 1. Verifies the signature (mocked here).
   * 2. Updates the `payments` and `orders` record to CAPTURED / PENDING.
   * 3. Creates immutable `order_items`.
   */
  async verifyPayment({ razorpayPaymentId, razorpayOrderId, razorpaySignature, eatnakedOrderId, deliveryLocation, cartItems }) {
    if (isSupabaseConfigured) {
      // Call actual Edge Function
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { razorpayPaymentId, razorpayOrderId, razorpaySignature, eatnakedOrderId, deliveryLocation, cartItems }
      });
      if (error) throw error;
      return data;
    }

    console.log('[MOCK BACKEND] Verifying payment signature for:', eatnakedOrderId);
    
    // Simulate signature verification passing
    // If it was a real backend we'd use crypto.createHmac using RAZORPAY_WEBHOOK_SECRET
    
    const orders = JSON.parse(localStorage.getItem('eatnaked_db_orders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === eatnakedOrderId);
    
    if (orderIndex === -1) throw new Error('Order not found in database.');
    
    const order = orders[orderIndex];
    if (order.status !== 'PAYMENT_PENDING') {
      throw new Error('Order is not in a payable state.');
    }
    
    // Simulate updating order to PAID/PENDING state
    order.status = 'PENDING';
    order.payment_status = 'CAPTURED';
    order.razorpay_payment_id = razorpayPaymentId;
    order.delivery_location = deliveryLocation;
    order.items = cartItems; // Snapshot of items at time of purchase
    
    orders[orderIndex] = order;
    localStorage.setItem('eatnaked_db_orders', JSON.stringify(orders));
    
    // Wait a bit to simulate network
    await new Promise(r => setTimeout(r, 800));
    
    console.log('[MOCK BACKEND] Order securely confirmed!', order);
    
    return {
      success: true,
      orderId: order.id
    };
  }
};
