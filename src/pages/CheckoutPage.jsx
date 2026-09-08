import { useState, useEffect, useRef } from 'react';
import { formatINR, parsePrice } from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { checkoutService } from '../services/checkoutService';
import LocationPickerModal from '../components/LocationPickerModal';
import PaymentMethodSelector from '../components/PaymentMethodSelector';
import GoogleMapsView from '../components/GoogleMapsView';
import RazorpayButton from '../components/RazorpayButton';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, activeCartRestaurant, deliveryLocation, clearCart } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const [billPreview, setBillPreview] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI or COD
  const isOrderPlacedRef = useRef(false);

  useEffect(() => {
    if (isOrderPlacedRef.current) return;
    if (!cartItems || cartItems.length === 0) {
      navigate('/');
      return;
    }
    calculatePreview();
  }, [cartItems, deliveryLocation, appliedCoupon]);

  const calculatePreview = () => {
    let subtotal = 0;
    cartItems.forEach(item => {
      const p = typeof item.rawPrice === 'number' ? item.rawPrice : parsePrice(item.price);
      subtotal += p * (item.quantity || 1);
    });

    const discount = appliedCoupon && (appliedCoupon.code === 'EAT50' || appliedCoupon.code === 'BIGBITES50')
      ? subtotal * 0.5
      : 0;
    const deliveryFee = subtotal > 499 ? 0 : 39;
    const tax = Math.round((subtotal - discount) * 0.05);
    const total = Math.max(0, (subtotal - discount) + deliveryFee + tax);

    setBillPreview({ subtotal, discount, deliveryFee, tax, total });
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode) return;
    const code = couponCode.trim().toUpperCase();
    if (code === 'EAT50' || code === 'BIGBITES50') {
      setAppliedCoupon({ code, discount_value: 50 });
    } else {
      setCouponError('Invalid coupon code. Use EAT50 for 50% off');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
    // Never reuse a Razorpay order after switching to COD.
    setRazorpayOrder(null);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);
      setLoadingMessage(paymentMethod === 'COD' ? 'Placing Cash on Delivery order...' : 'Creating payment order...');
      setRazorpayOrder(null);

      let orderUserId;
      if (isSupabaseConfigured) {
        const {
          data: { user: authUser },
          error: authError
        } = await supabase.auth.getUser();
        if (authError || !authUser) {
          alert('Your login session is not active. Please log in again.');
          return;
        }
        orderUserId = authUser.id;
      } else {
        if (!user?.id) {
          alert('Your login session is not active. Please log in again.');
          return;
        }
        orderUserId = user.id;
      }

      const rest = activeCartRestaurant || {
        id: 'kitchen-1',
        name: 'BIGBITES Flagship Kitchen',
        lat: 28.6315,
        lng: 77.2167
      };

      const orderResponse = await checkoutService.createRazorpayOrder({
        cartItems: cartItems.map(i => ({
          id: i.id,
          quantity: i.quantity,
          price: i.price,
          rawPrice: i.rawPrice
        })),
        restaurantId: rest.id,
        couponCode: appliedCoupon?.code || null,
        userId: orderUserId,
        paymentMethod
      });
      // COD is a complete order-placement flow. Do NOT create, open, or show Razorpay.
      if (paymentMethod === 'COD') {
        if (orderResponse.paymentMethod !== 'COD') {
          throw new Error('COD order was not created correctly. Please try again.');
        }
        // COD flow - directly consider order placed
        isOrderPlacedRef.current = true;
        clearCart();
        navigate(`/orders/${orderResponse.orderId}/track`, {
          replace: true,
          state: { paymentMethod: 'COD', restaurant: rest }
        });
        return;
      }

      if (orderResponse.paymentMethod !== 'UPI' || !orderResponse.razorpayOrderId) {
        throw new Error('UPI payment order was not created correctly.');
      }

      setRazorpayOrder(orderResponse);
      setLoadingMessage('Ready for UPI payment');
    } catch (err) {
      console.error('Checkout error:', err);
      alert(`Checkout failed: ${err.message || 'Unexpected error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading checkout...</div>;
  }

  const currentLat = deliveryLocation?.latitude || deliveryLocation?.lat || 28.6315;
  const currentLng = deliveryLocation?.longitude || deliveryLocation?.lng || 77.2167;

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', padding: '3rem 1rem 5rem' }}>
      <div style={{ maxWidth: '840px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', color: 'var(--brand-dark)', marginBottom: '2rem', textAlign: 'center', fontWeight: 700 }}>
          Confirm &amp; Place Order
        </h1>

        {loading ? (
          <div style={{ backgroundColor: '#FFFFFF', padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px', border: '1px solid #ECE7DF', boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔄</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', margin: 0, fontSize: '1.4rem' }}>{loadingMessage}</h2>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#FFFFFF', padding: 'clamp(1rem, 3vw, 1.75rem)', borderRadius: '20px', border: '1px solid #ECE7DF', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.6rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Delivery Destination</span>
                  <p style={{ margin: '0.2rem 0', fontWeight: 700, fontSize: '1.05rem', color: 'var(--brand-dark)' }}>{deliveryLocation?.address || 'Connaught Place, Inner Circle, New Delhi'}</p>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#78716C' }}>📍 {Number(currentLat).toFixed(4)}, {Number(currentLng).toFixed(4)}</p>
                </div>
                <button type="button" onClick={() => setLocationModalOpen(true)} className="btn-see-all" style={{ minHeight: '40px', padding: '0.4rem 0.85rem' }}>Change Location</button>
              </div>
              <div style={{ height: 'min(140px, 25vh)', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ECE7DF', minHeight: '110px' }}>
                <GoogleMapsView customerLocation={{ lat: currentLat, lng: currentLng, label: deliveryLocation?.label || 'DELIVERY', address: deliveryLocation?.address }} showRoute={false} interactive={false} height="100%" minHeight="110px" />
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: 'clamp(1rem, 3vw, 1.75rem)', borderRadius: '20px', border: '1px solid #ECE7DF' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #EFEAE2', fontSize: '1.2rem', fontWeight: 700 }}>{activeCartRestaurant?.name || 'BIGBITES Kitchen'}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {cartItems.map((item) => {
                  const p = typeof item.rawPrice === 'number' ? item.rawPrice : parsePrice(item.price);
                  return <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {item.image && <img src={item.image} alt={item.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />}
                      <div><span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--brand-dark)' }}>{item.name}</span><span style={{ fontSize: '0.8rem', color: '#78716C', display: 'block' }}>Qty: {item.quantity}</span></div>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--brand-dark)' }}>{formatINR(p * (item.quantity || 1))}</span>
                  </div>;
                })}
              </div>
            </div>

            <div style={{ backgroundColor: '#FFFFFF', padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '20px', border: '1px solid #ECE7DF' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 0.8rem', fontSize: '1.1rem', fontWeight: 700 }}>Voucher Code</h3>
              {appliedCoupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0FDF4', padding: '0.85rem 1.25rem', borderRadius: '12px', border: '1px solid #86EFAC', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ color: '#166534', fontWeight: 700, fontSize: '0.9rem' }}>✓ {appliedCoupon.code} applied — {appliedCoupon.discount_value}% OFF</div>
                  <button onClick={handleRemoveCoupon} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 700, cursor: 'pointer', fontSize: '0.85rem', minHeight: '44px', padding: '0.3rem 0.6rem' }}>Remove</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input type="text" placeholder="Enter promo code (e.g. EAT50)" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} style={{ flex: '1 1 180px', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #ECE7DF', textTransform: 'uppercase', outline: 'none', minHeight: '44px' }} />
                    <button onClick={handleApplyCoupon} className="btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.88rem', minHeight: '44px' }}>Apply</button>
                  </div>
                  {couponError && <p style={{ color: '#DC2626', margin: '0.4rem 0 0', fontSize: '0.82rem', fontWeight: 600 }}>{couponError}</p>}
                </div>
              )}
            </div>

            {billPreview && <div style={{ backgroundColor: '#FFFFFF', padding: 'clamp(1rem, 3vw, 1.75rem)', borderRadius: '20px', border: '1px solid #ECE7DF' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', margin: '0 0 1rem', fontSize: '1.15rem', fontWeight: 700 }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderBottom: '1px solid #EFEAE2', paddingBottom: '1rem', marginBottom: '1rem', fontSize: '0.9rem', color: '#57534E' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Food Subtotal</span><span>{formatINR(billPreview.subtotal)}</span></div>
                {billPreview.discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16A34A', fontWeight: 700 }}><span>Discount ({appliedCoupon?.code})</span><span>−{formatINR(billPreview.discount)}</span></div>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Delivery Fee</span><span>{billPreview.deliveryFee === 0 ? 'FREE' : formatINR(billPreview.deliveryFee)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Estimated Tax</span><span>{formatINR(billPreview.tax)}</span></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.3rem', fontWeight: 800, color: 'var(--brand-dark)' }}><span>Grand Total:</span><span style={{ color: 'var(--brand-primary)' }}>{formatINR(billPreview.total)}</span></div>
            </div>}

            <PaymentMethodSelector selectedMethod={paymentMethod} onChange={handlePaymentMethodChange} />

            {paymentMethod === 'UPI' && razorpayOrder ? (
              <RazorpayButton
                order={razorpayOrder}
                onSuccess={async (paymentData) => {
                  try {
                    setLoading(true);
                    setLoadingMessage('Verifying payment...');
                    const verification = await checkoutService.verifyPayment({
                      razorpayPaymentId: paymentData.razorpay_payment_id,
                      razorpayOrderId: paymentData.razorpay_order_id,
                      razorpaySignature: paymentData.razorpay_signature,
                      bigbitesOrderId: razorpayOrder.bigbitesOrderId,
                      deliveryLocation: deliveryLocation || { address: 'Connaught Place, Inner Circle, New Delhi 110001', lat: 28.6315, lng: 77.2167, label: 'HOME' },
                      cartItems
                    });
                    if (verification.success) {
                      isOrderPlacedRef.current = true;
                      clearCart();
                      navigate(`/orders/${verification.orderId}/track`, { replace: true });
                    }
                  } catch (e) {
                    console.error(e);
                    alert(e.message || 'Payment verification failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={(err) => {
                  console.error(err);
                  alert(err.message || 'Payment failed');
                }}
              />
            ) : (
              <button type="button" onClick={handlePlaceOrder} className="btn-primary" style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                {paymentMethod === 'COD' ? 'Place Order — Cash on Delivery' : `Create UPI Payment (${formatINR(billPreview?.total || 0)})`}
              </button>
            )}
          </div>
        )}
      </div>

      <LocationPickerModal isOpen={locationModalOpen} onClose={() => setLocationModalOpen(false)} />
    </div>
  );
}
