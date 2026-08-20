import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../lib/supabase';

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial fetch
    async function load() {
      try {
        const data = await orderService.getOrderById(id);
        if (data) {
          setOrder(data);
        } else {
          navigate('/orders');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();

    // Subscribe to realtime updates for this specific order
    const unsubscribe = orderService.subscribeToOrder(id, (updatedOrder) => {
      console.log('Realtime Order Update Received!', updatedOrder);
      setOrder(updatedOrder);
    });

    return () => unsubscribe();
  }, [id, navigate]);

  if (loading || !order) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Order...</div>;

  // Timeline Helper
  const getTimelineSteps = (status, paymentStatus) => {
    const isPaid = paymentStatus === 'CAPTURED';
    const isCancelled = status === 'CANCELLED';
    
    // Ordered progression
    const levels = {
      'PENDING': 0,
      'ACCEPTED': 1,
      'PREPARING': 2,
      'READY_FOR_PICKUP': 3,
      'DRIVER_ASSIGNED': 4,
      'OUT_FOR_DELIVERY': 5,
      'DELIVERED': 6
    };
    
    const currentLevel = levels[status] || 0;

    return [
      { label: 'ORDER PLACED', active: true, time: order.created_at },
      { label: 'PAYMENT CONFIRMED', active: isPaid, time: order.created_at },
      { label: isCancelled ? 'ORDER CANCELLED' : 'RESTAURANT ACCEPTED', active: currentLevel >= 1 || isCancelled, time: order.accepted_at || order.rejected_at, isError: isCancelled },
      { label: 'PREPARING', active: currentLevel >= 2 && !isCancelled, time: order.preparing_at },
      { label: 'READY FOR PICKUP', active: currentLevel >= 3 && !isCancelled, time: order.ready_at }
    ];
  };

  const steps = getTimelineSteps(order.status, order.payment_status);

  return (
    <div style={{ backgroundColor: 'var(--cream)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        {/* Header Area */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div 
            style={{ 
              width: '80px', 
              height: '80px', 
              backgroundColor: order.status === 'CANCELLED' ? 'var(--red)' : 'var(--green)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--white)',
              fontSize: '3rem',
              animation: 'bounceIn 0.5s ease-out'
            }}
          >
            {order.status === 'CANCELLED' ? 'X' : '✓'}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--black)', margin: '0 0 0.5rem' }}>
            {order.status === 'CANCELLED' ? 'ORDER CANCELLED' : 'ORDER PLACED'}
          </h1>
          <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>
            {order.status === 'CANCELLED' ? 'The restaurant rejected your order.' : 'Your order has been securely confirmed.'}
          </p>
        </div>

        {order.status === 'CANCELLED' && order.rejection_reason && (
           <div style={{ padding: '1rem', backgroundColor: '#ffebee', border: '1px solid var(--red)', color: 'var(--red)', marginBottom: '1.5rem', textAlign: 'center', fontWeight: 'bold' }}>
             Reason: {order.rejection_reason}
           </div>
        )}

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          {/* Timeline Section */}
          <div style={{ flex: '1', minWidth: '250px', backgroundColor: 'var(--white)', padding: '2rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 1.5rem', fontSize: '1.5rem' }}>TRACKING</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
              {/* Connecting Line */}
              <div style={{ position: 'absolute', left: '11px', top: '20px', bottom: '20px', width: '2px', backgroundColor: '#eee', zIndex: 0 }}></div>

              {steps.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative', zIndex: 1, opacity: step.active ? 1 : 0.4 }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '50%', 
                    backgroundColor: step.active ? (step.isError ? 'var(--red)' : 'var(--green)') : '#eee',
                    border: step.active ? 'none' : '2px solid #ccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '12px'
                  }}>
                    {step.active && (step.isError ? '×' : '✓')}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', color: step.isError ? 'var(--red)' : 'var(--black)' }}>{step.label}</div>
                    {step.time && <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(step.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Receipt Section */}
          <div style={{ flex: '1', minWidth: '300px', backgroundColor: 'var(--white)', padding: '2rem', border: 'var(--border-thick)', boxShadow: '4px 4px 0px var(--black)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--black)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', margin: '0 0 0.2rem' }}>
                  #{order.id}
                </h2>
                <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                  PAYMENT: <strong style={{ color: 'var(--green)' }}>{order.payment_status}</strong>
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: '0 0 0.8rem' }}>DELIVER TO</h3>
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5' }}>
                <strong>{order.delivery_location?.label || 'HOME'}</strong><br/>
                {order.delivery_location?.address}
              </p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', margin: '0 0 0.8rem' }}>ITEMS</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                    <span>{item.quantity} × {item.name}</span>
                    <span>₹{item.rawPrice * item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '2px dashed #eee', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.95rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Subtotal</span>
                  <span>₹{order.subtotal}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#2e7d32', fontWeight: 'bold' }}>
                    <span>{order.coupon_code} Discount</span>
                    <span>−₹{order.discount_amount}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Delivery Fee</span>
                  <span>₹{order.delivery_fee}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tax</span>
                  <span>₹{order.tax_amount}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '1.4rem', fontWeight: 'bold', marginTop: '1rem', borderTop: '2px solid var(--black)', paddingTop: '1rem' }}>
                <span>TOTAL</span>
                <span>₹{order.amount}</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button 
            onClick={() => navigate('/')} 
            className="btn-editorial-outline"
            style={{ padding: '1rem 2rem', fontSize: '1rem', backgroundColor: 'transparent' }}
          >
            ← BACK TO HOME
          </button>
        </div>

      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
