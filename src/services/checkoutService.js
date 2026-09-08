import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { parsePrice } from '../utils/currency';

export const checkoutService = {
  
  /**
   * Create a checkout order
   * 1. Re-fetches active restaurant to ensure it's ACTIVE.
   * 2. Re-fetches menu items to calculate authoritative prices.
   * 3. Calculates (Food Subtotal - Coupon) + Delivery + Tax.
   * 4. Returns checkout response with order IDs.
   */
  async createRazorpayOrder({ cartItems, restaurantId, couponCode, userId, paymentMethod = 'UPI' }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { cartItems, restaurantId, couponCode, userId }
      });
      if (error) throw error;
      return data;
    }

    const allRestaurants = JSON.parse(localStorage.getItem('bigbites_db_restaurants') || '[]');
    const restaurant = allRestaurants.find(r => r.id === restaurantId) || allRestaurants[0];
    
    if (!restaurant) throw new Error('Restaurant not found.');
    
    // Flat map all items from all categories for lookup
    const allValidItems = (restaurant.categories || []).flatMap(cat => cat.items || []);

    let authoritativeSubtotal = 0;
    
    for (const item of cartItems) {
      const dbItem = allValidItems.find(i => i.id === item.id) || item;
      const itemPrice = typeof dbItem.price === 'number' ? dbItem.price : (parsePrice(dbItem.price) || 199);
      authoritativeSubtotal += (itemPrice * (item.quantity || 1));
    }
    
    let discount = 0;
    if (couponCode) {
      const code = couponCode.trim().toUpperCase();
      if (code === 'EAT50' || code === 'BIGBITES50') {
        discount = authoritativeSubtotal * 0.5;
      } else {
        throw new Error('Invalid coupon code. Use EAT50 for 50% off.');
      }
    }
    
    // Delivery fee: free above ₹499, otherwise ₹39
    const deliveryFee = authoritativeSubtotal > 499 ? 0 : 39;
    // 5% GST on food after discount
    const tax = Math.round((authoritativeSubtotal - discount) * 0.05);
    const finalAmount = Math.max(0, (authoritativeSubtotal - discount) + deliveryFee + tax);
    
    const mockRazorpayOrderId = `order_${Math.random().toString(36).substring(2, 12)}`;
    const mockOrderId = `ORD-${Date.now()}`;
    
    const pendingOrder = {
      id: mockOrderId,
      customer_id: userId,
      restaurant_id: restaurant.id,
      restaurant_name: restaurant.name,
      restaurant_lat: restaurant.lat || 28.6315,
      restaurant_lng: restaurant.lng || 77.2167,
      status: 'PAYMENT_PENDING',
      amount: finalAmount,
      subtotal: authoritativeSubtotal,
      discount_amount: discount,
      delivery_fee: deliveryFee,
      tax_amount: tax,
      coupon_code: couponCode,
      created_at: new Date().toISOString()
    };
    
    const orders = JSON.parse(localStorage.getItem('bigbites_db_orders') || '[]');
    orders.push(pendingOrder);
    localStorage.setItem('bigbites_db_orders', JSON.stringify(orders));

    await new Promise(r => setTimeout(r, 400));

    if (paymentMethod.toUpperCase() === 'COD') {
      // COD flow – no Razorpay order needed
      return {
        orderId: mockOrderId,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING'
      };
    }
    return {
      razorpayKeyId: 'rzp_test_mockkey123',
      amount: Math.round(finalAmount * 100), // Convert INR to paise for Razorpay
      currency: 'INR',
      razorpayOrderId: mockRazorpayOrderId,
      bigbitesOrderId: mockOrderId
    };
  },
  
  /**
   * Verify Payment and Save Immutable Delivery Snapshot & Delivery Record
   */
  async verifyPayment({ razorpayPaymentId, razorpayOrderId, razorpaySignature, bigbitesOrderId, deliveryLocation, cartItems }) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { razorpayPaymentId, razorpayOrderId, razorpaySignature, bigbitesOrderId, deliveryLocation, cartItems }
      });
      if (error) throw error;
      return data;
    }

    const orders = JSON.parse(localStorage.getItem('bigbites_db_orders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === bigbitesOrderId);
    
    if (orderIndex === -1) throw new Error('Order not found in database.');
    
    const order = orders[orderIndex];

    const delivAddress = deliveryLocation?.address || deliveryLocation?.formatted_address || 'Connaught Place, New Delhi';
    const delivLat = deliveryLocation?.latitude || deliveryLocation?.lat || 28.6315;
    const delivLng = deliveryLocation?.longitude || deliveryLocation?.lng || 77.2167;

    // Snapshot immutable delivery coordinates on the order
    order.status = 'PENDING';
    order.payment_status = 'CAPTURED';
    order.razorpay_payment_id = razorpayPaymentId;
    order.delivery_address = delivAddress;
    order.delivery_latitude = delivLat;
    order.delivery_longitude = delivLng;
    order.delivery_location = {
      address: delivAddress,
      lat: delivLat,
      lng: delivLng,
      label: deliveryLocation?.label || 'HOME'
    };
    order.items = cartItems;

    orders[orderIndex] = order;
    localStorage.setItem('bigbites_db_orders', JSON.stringify(orders));
    
    // Create corresponding entry in the `deliveries` table (Requirement 7)
    const deliveries = JSON.parse(localStorage.getItem('bigbites_db_deliveries') || '[]');
    const newDelivery = {
      id: `deliv-${Date.now()}`,
      order_id: order.id,
      driver_id: null,
      status: 'Pending',
      pickup_latitude: order.restaurant_lat || 28.6315,
      pickup_longitude: order.restaurant_lng || 77.2167,
      delivery_latitude: delivLat,
      delivery_longitude: delivLng,
      current_latitude: order.restaurant_lat || 28.6315,
      current_longitude: order.restaurant_lng || 77.2167,
      heading: 0,
      speed: 0,
      last_location_update: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    deliveries.push(newDelivery);
    localStorage.setItem('bigbites_db_deliveries', JSON.stringify(deliveries));

    window.dispatchEvent(new Event('mock_realtime_order_update'));

    await new Promise(r => setTimeout(r, 400));
    
    return {
      success: true,
      orderId: order.id
    };
  }
};
