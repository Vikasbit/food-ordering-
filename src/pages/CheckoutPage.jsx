import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { checkoutService } from '../services/checkoutService';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, activeCartRestaurant, deliveryLocation, clearCart } = useCart();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Local preview state
  const [billPreview, setBillPreview] = useState(null);

  useEffect(() => {
    // Enforce valid cart and address
    if (!cartItems || cartItems.length === 0) {
      navigate('/cart');
      return;
    }
    if (!deliveryLocation) {
      navigate('/');
      return;
    }
    
    // Calculate initial preview
    calculatePreview();
  }, [cartItems, deliveryLocation, appliedCoupon]);

  const calculatePreview = () => {
    let subtotal = 0;
    cartItems.forEach(item => {
      subtotal += item.rawPrice * item.quantity;
    });
    
    let discount = 0;
    if (appliedCoupon && appliedCoupon.code === 'EAT50') {
      discount = subtotal * 0.5;
    }
    
    const deliveryFee = 40;
    const tax = Math.round((subtotal - discount) * 0.05); // 5% tax on discounted food
    
    setBillPreview({
      subtotal,
      discount,
      deliveryFee,
      tax,
      total: (subtotal - discount) + deliveryFee + tax
    });
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    if (!couponCode) return;
    
    const code = couponCode.trim().toUpperCase();
    if (code === 'EAT50') {
      setAppliedCoupon({ code: 'EAT50', discount_type: 'PERCENTAGE', discount_value: 50 });
    } else {
      setCouponError('Invalid coupon code.');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!user) {
      alert('Please log in to checkout.');
      return;
    }

    try {
      setLoading(true);
      setLoadingMessage('Calculating total...');
      
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your connection.');
      }

      setLoadingMessage('Creating payment...');
      
      // 1. Call secure backend to calculate authoritative total and generate Razorpay Order ID
      const orderResponse = await checkoutService.createRazorpayOrder({
        cartItems: cartItems.map(i => ({ id: i.id, quantity: i.quantity })),
        restaurantId: activeCartRestaurant.id,
        couponCode: appliedCoupon?.code || null,
        userId: user.id
      });

      setLoadingMessage('Opening Razorpay...');
      
      // 2. Open Razorpay Checkout
      const options = {
        key: orderResponse.razorpayKeyId, // Public Key from backend
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'EATnaked',
        description: `Order from ${activeCartRestaurant.name}`,
        order_id: orderResponse.razorpayOrderId,
        prefill: {
          name: user.full_name,
          email: user.email,
          contact: user.phone || ''
        },
        theme: {
          color: '#ff3b30' // var(--red)
        },
        handler: async function (response) {
          try {
            setLoading(true);
            setLoadingMessage('Verifying payment...');
            
            // 3. Send signature to backend for strict verification
            const verification = await checkoutService.verifyPayment({
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              eatnakedOrderId: orderResponse.eatnakedOrderId,
              deliveryLocation,
              cartItems // Passed strictly for mock purposes (a real edge function would pull from db)
            });

            if (verification.success) {
              setLoadingMessage('Confirming order...');
              clearCart();
              navigate(`/order/${verification.orderId}`, { replace: true });
            } else {
              throw new Error('Payment verification failed.');
            }
          } catch (err) {
            console.error(err);
            alert('Your payment could not be completed securely. Please try again.');
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response) {
        setLoading(false);
        alert(`Payment failed: ${response.error.description}`);
      });
      
      // Handle modal close
      rzp.on('modal.closed', function() {
        setLoading(false);
        // Do not alert aggressively here, just return to checkout
        console.log("Payment cancelled. Cart saved.");
      });

      rzp.open();
      
    } catch (err) {
      console.error(err);
      alert(err.message || 'An error occurred during checkout.');
      setLoading(false);
    }
  };

  if (!cartItems || cartItems.length === 0 || !deliveryLocation) {
    return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading checkout...</div>;
  }

  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--black)', marginBottom: '2rem', textAlign: 'center' }}>
          CHECKOUT
        </h1>

        {loading ? (
          <div style={{ backgroundColor: 'var(--white)', padding: '4rem 2rem', textAlign: 'center', border: 'var(--border-thick)' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
            <h2 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>{loadingMessage}</h2>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Delivery Address Section */}
            <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 0.5rem', color: '#666' }}>DELIVER TO</h3>
                  <p style={{ margin: 0, fontWeight: 'bold' }}>{deliveryLocation.address}</p>
                </div>
                <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', textDecoration: 'underline', cursor: 'pointer', fontWeight: 'bold' }}>Change</button>
              </div>
            </div>

            {/* Restaurant & Items Section */}
            <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #eee' }}>
                {activeCartRestaurant?.name}
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {cartItems.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '0.85rem', marginRight: '0.5rem' }}>{item.quantity} ×</span>
                      <span style={{ fontWeight: '500' }}>{item.name}</span>
                    </div>
                    <span>₹{item.rawPrice * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coupon Section */}
            <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1rem' }}>APPLY COUPON</h3>
              
              {appliedCoupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e8f5e9', padding: '1rem', border: '1px solid #4caf50' }}>
                  <div style={{ color: '#2e7d32', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ✓ {appliedCoupon.code} applied — {appliedCoupon.discount_value}% OFF
                  </div>
                  <button onClick={handleRemoveCoupon} style={{ background: 'transparent', border: 'none', color: '#d32f2f', fontWeight: 'bold', cursor: 'pointer' }}>Remove</button>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="Enter code (Try EAT50)" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={{ flex: 1, padding: '0.8rem', border: '1px solid #111', fontFamily: 'var(--font-body)', textTransform: 'uppercase' }}
                    />
                    <button onClick={handleApplyCoupon} style={{ padding: '0 1.5rem', backgroundColor: 'var(--black)', color: 'var(--white)', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
                      APPLY
                    </button>
                  </div>
                  {couponError && <p style={{ color: 'var(--red)', margin: '0.5rem 0 0', fontSize: '0.85rem' }}>{couponError}</p>}
                </div>
              )}
            </div>

            {/* Bill Summary Section */}
            {billPreview && (
              <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1rem' }}>BILL SUMMARY</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderBottom: '2px dashed #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>ITEM TOTAL</span>
                    <span>₹{billPreview.subtotal}</span>
                  </div>
                  
                  {billPreview.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32', fontWeight: 'bold' }}>
                      <span>DISCOUNT ({appliedCoupon?.code})</span>
                      <span>−₹{billPreview.discount}</span>
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>DELIVERY FEE</span>
                    <span>₹{billPreview.deliveryFee}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>TAXES</span>
                    <span>₹{billPreview.tax}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  <span>TOTAL</span>
                  <span>₹{billPreview.total}</span>
                </div>
              </div>
            )}

            {/* Pay Now Button */}
            <button 
              onClick={handlePayment}
              className="btn-editorial"
              style={{ width: '100%', padding: '1.2rem', backgroundColor: 'var(--red)', color: 'var(--white)', fontSize: '1.2rem', marginTop: '1rem' }}
            >
              PAY NOW — ₹{billPreview?.total}
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
