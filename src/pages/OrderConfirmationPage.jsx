import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService, driverService } from '../lib/supabase';
import GoogleMapsView from '../components/GoogleMapsView';
import { calculateDistance } from '../utils/geo';

export default function OrderConfirmationPage() {
  const params = useParams();
  const id = params.orderId || params.id;
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const lastUpdateRef = useRef(Date.now());

  useEffect(() => {
    async function load() {
      try {
        const data = await orderService.getOrderById(id);
        if (data) {
          setOrder(data);
        } else {
          // Check localStorage as fallback
          const all = JSON.parse(localStorage.getItem('bigbites_db_orders') || '[]');
          const matched = all.find(o => o.id === id) || all[all.length - 1];
          if (matched) setOrder(matched);
        }
      } catch (err) {
        console.error('Failed to load order:', err);
      } finally {
        setLoading(false);
      }
    }
    load();

    // Subscribe to order status changes via Supabase Realtime
    const unsubscribeOrder = orderService.subscribeToOrder(id, (updatedOrder) => {
      if (updatedOrder) {
        setOrder(updatedOrder);
      }
    });

    return () => unsubscribeOrder && unsubscribeOrder();
  }, [id]);

  // Handle Driver Location Realtime Subscription
  useEffect(() => {
    if (!order) return;

    const normalizedStatus = (order.status || '').toUpperCase().replace(/\s+/g, '_');
    const isDeliveryActive = ['OUT_FOR_DELIVERY', 'PICKED_UP', 'DRIVER_ASSIGNED', 'READY_FOR_PICKUP'].includes(normalizedStatus);

    if (isDeliveryActive) {
      setIsRealtimeActive(true);

      const unsubDriver = driverService.subscribeToDriverLocation(order.id, (loc) => {
        if (loc) {
          lastUpdateRef.current = Date.now();
          setDriverLocation({
            latitude: loc.latitude || loc.lat,
            longitude: loc.longitude || loc.lng,
            heading: loc.heading || 0,
            speed: loc.speed || 0,
            driverName: order.driver_name || 'BIGBITES Delivery Partner',
            recorded_at: loc.recorded_at || new Date().toISOString()
          });
        }
      });

      return () => unsubDriver && unsubDriver();
    } else if (normalizedStatus === 'DELIVERED') {
      setIsRealtimeActive(false);
    }
  }, [order?.id, order?.status, order?.driver_name]);

  if (loading) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-main)', minHeight: '80vh' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔄</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--brand-dark)' }}>
          Loading Order Status #{id}...
        </h2>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center', backgroundColor: 'var(--bg-main)', minHeight: '80vh' }}>
        <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📦</span>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: 'var(--brand-dark)', margin: '0 0 0.5rem' }}>
          Order Not Found
        </h2>
        <p style={{ color: '#78716C', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
          We couldn't locate this order in your current session.
        </p>
        <button type="button" onClick={() => navigate('/')} className="btn-primary">
          Return to Home
        </button>
      </div>
    );
  }

  // 5 Defined Delivery Status Timeline
  const STATUS_CONFIG = [
    { key: 'CONFIRMED', label: 'Order Confirmed', icon: '✓', desc: 'Kitchen has accepted your order' },
    { key: 'PREPARING', label: 'Preparing', icon: '🍳', desc: 'Fresh ingredients being cooked' },
    { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', icon: '📦', desc: 'Packed and ready at counter' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🛵', desc: 'Delivery partner on the way' },
    { key: 'DELIVERED', label: 'Delivered', icon: '🎉', desc: 'Order delivered to doorstep' }
  ];

  const currentStatusUpper = (order.status || 'CONFIRMED').toUpperCase().replace(/\s+/g, '_');
  
  const getStatusLevel = (status) => {
    switch (status) {
      case 'PENDING':
      case 'ACCEPTED':
      case 'CONFIRMED': return 0;
      case 'PREPARING': return 1;
      case 'READY_FOR_PICKUP':
      case 'DRIVER_ASSIGNED': return 2;
      case 'PICKED_UP':
      case 'OUT_FOR_DELIVERY': return 3;
      case 'DELIVERED': return 4;
      default: return 0;
    }
  };

  const currentLevel = getStatusLevel(currentStatusUpper);
  const isOutForDelivery = currentLevel >= 3 && currentStatusUpper !== 'DELIVERED';
  const isDelivered = currentStatusUpper === 'DELIVERED';

  // Live ETA Calculation
  const custLat = order.delivery_latitude || order.delivery_lat || order.delivery_location?.lat || 28.6315;
  const custLng = order.delivery_longitude || order.delivery_lng || order.delivery_location?.lng || 77.2167;
  const rLat = order.restaurant_lat || 28.6315;
  const rLng = order.restaurant_lng || 77.2167;

  const currentDriverLat = driverLocation?.latitude || rLat;
  const currentDriverLng = driverLocation?.longitude || rLng;

  const distanceKm = calculateDistance(currentDriverLat, currentDriverLng, custLat, custLng);
  const etaMinutes = Math.max(3, Math.round((distanceKm / 22) * 60 + 4));

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', padding: '3rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '1180px', margin: '0 auto' }}>
        
        {/* Top Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: isDelivered ? '#DCFCE7' : '#FFF7ED',
              color: isDelivered ? '#16A34A' : 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.8rem',
              boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
              border: '1px solid #ECE7DF'
            }}
          >
            {isDelivered ? '🎉' : isOutForDelivery ? '🛵' : '✓'}
          </div>

          <span
            style={{
              backgroundColor: '#FEF3C7',
              color: '#92400E',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.8rem',
              borderRadius: '9999px',
              display: 'inline-block',
              marginBottom: '0.4rem',
              letterSpacing: '0.04em'
            }}
          >
            ORDER #{order.id}
          </span>

          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 3.2vw, 2.7rem)',
              color: 'var(--brand-dark)',
              margin: '0 0 0.4rem',
              fontWeight: 700
            }}
          >
            {isDelivered
              ? 'Order Delivered!'
              : isOutForDelivery
              ? 'Your order is on the way!'
              : currentLevel === 1
              ? 'Preparing your food fresh'
              : 'Order confirmed!'}
          </h1>

          <p style={{ color: '#78716C', fontSize: '0.95rem', margin: 0 }}>
            {isOutForDelivery
              ? `Delivery partner is heading your way • ETA ~${etaMinutes} mins`
              : `Delivery to ${order.delivery_address || order.delivery_location?.address || 'Connaught Place, New Delhi'}`}
          </p>
        </div>

        {/* 2-Column Layout: LEFT = Order Status & Details; RIGHT = Live Map (when delivery active) or Kitchen Progress Card */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '0.95fr 1.05fr',
            gap: '2rem',
            alignItems: 'start'
          }}
          className="order-track-grid"
        >
          {/* LEFT COLUMN: Order Status Pipeline & Summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Status Timeline */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '1.75rem',
                borderRadius: '20px',
                border: '1px solid #ECE7DF',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
              }}
            >
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  margin: '0 0 1.25rem',
                  color: 'var(--brand-dark)'
                }}
              >
                Order Timeline
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', position: 'relative' }}>
                {/* Vertical connecting line */}
                <div
                  style={{
                    position: 'absolute',
                    left: '15px',
                    top: '16px',
                    bottom: '16px',
                    width: '2px',
                    backgroundColor: '#EFEAE2',
                    zIndex: 0
                  }}
                />

                {STATUS_CONFIG.map((step, idx) => {
                  const isPassed = currentLevel >= idx;
                  const isCurrent = currentLevel === idx;

                  return (
                    <div
                      key={step.key}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        position: 'relative',
                        zIndex: 1,
                        opacity: isPassed ? 1 : 0.45
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: isCurrent ? 'var(--brand-primary)' : isPassed ? '#16A34A' : '#FAF5EE',
                          color: isPassed || isCurrent ? '#FFFFFF' : '#78716C',
                          border: isCurrent ? '2px solid var(--brand-primary)' : '1px solid #ECE7DF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                          fontWeight: 800,
                          flexShrink: 0,
                          boxShadow: isCurrent ? '0 0 0 4px rgba(234, 88, 12, 0.2)' : 'none'
                        }}
                      >
                        {isPassed && !isCurrent ? '✓' : step.icon}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: isCurrent ? 800 : 600,
                            color: isCurrent ? 'var(--brand-primary)' : 'var(--brand-dark)'
                          }}
                        >
                          {step.label}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#78716C', marginTop: '2px' }}>
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                padding: '1.75rem',
                borderRadius: '20px',
                border: '1px solid #ECE7DF',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid #EFEAE2',
                  marginBottom: '1rem'
                }}
              >
                <div>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.15rem', margin: 0, fontWeight: 700 }}>
                    {order.restaurant_name || 'BIGBITES Kitchen'}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: '#78716C' }}>
                    {new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#16A34A', backgroundColor: '#F0FDF4', padding: '0.2rem 0.6rem', borderRadius: '9999px' }}>
                  ● Paid Securely
                </span>
              </div>

              {/* Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {order.items?.map((item, idx) => {
                  const p = typeof item.rawPrice === 'number' ? item.rawPrice : parseFloat(item.price?.toString().replace(/[^0-9.]/g, '') || '199');
                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                      <span style={{ color: 'var(--brand-dark)' }}>{item.quantity || 1} × {item.name}</span>
                      <span style={{ fontWeight: 700 }}>₹{(p * (item.quantity || 1)).toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Total */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #EFEAE2',
                  paddingTop: '0.75rem',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--brand-dark)'
                }}
              >
                <span>Total Paid:</span>
                <span style={{ color: 'var(--brand-primary)' }}>
                  ₹{Number(order.amount || order.subtotal || 0).toFixed(0)}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '0.85rem' }}>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-outline"
                style={{ flex: 1, padding: '0.85rem', fontSize: '0.9rem' }}
              >
                ← Return to Home
              </button>
              <button
                type="button"
                onClick={() => navigate('/dev/driver')}
                className="btn-see-all"
                style={{ padding: '0.85rem 1.2rem', fontSize: '0.85rem' }}
                title="Open delivery partner simulator to send real GPS coordinates"
              >
                🛵 Partner GPS App
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Map (When Out for Delivery) OR Kitchen Order Progress Display */}
          <div>
            {isOutForDelivery || isDelivered ? (
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #ECE7DF',
                  overflow: 'hidden',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.04)'
                }}
              >
                {/* Live Radar Header */}
                <div
                  style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #EFEAE2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#FAF5EE'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: '#16A34A',
                        display: 'inline-block',
                        animation: 'pulse 2s infinite'
                      }}
                    />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-dark)' }}>
                      Live Realtime Delivery Radar
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#FEF3C7', color: '#92400E', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 700 }}>
                    ⏱️ ~{etaMinutes} mins ({distanceKm.toFixed(1)} km)
                  </div>
                </div>

                {/* Google Maps View */}
                <div style={{ height: '480px', width: '100%', position: 'relative' }}>
                  <GoogleMapsView
                    customerLocation={{
                      lat: custLat,
                      lng: custLng,
                      label: order.delivery_location?.label || 'HOME',
                      address: order.delivery_address || order.delivery_location?.address
                    }}
                    kitchenLocation={{
                      lat: rLat,
                      lng: rLng,
                      name: order.restaurant_name || 'BIGBITES Kitchen Hub'
                    }}
                    driverLocation={driverLocation || { latitude: currentDriverLat, longitude: currentDriverLng, heading: driverLocation?.heading || 0 }}
                    showRoute={true}
                    interactive={true}
                    height="100%"
                    minHeight="480px"
                  />
                </div>

                {/* Driver Status Footer */}
                <div
                  style={{
                    padding: '1rem 1.5rem',
                    borderTop: '1px solid #EFEAE2',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '0.8rem',
                    fontSize: '0.85rem'
                  }}
                >
                  <div>
                    <span style={{ color: '#78716C' }}>Delivery Partner: </span>
                    <strong style={{ color: 'var(--brand-dark)' }}>{order.driver_name || 'BIGBITES Express Rider'}</strong>
                  </div>
                  <div style={{ color: '#16A34A', fontWeight: 700 }}>
                    🟢 Realtime GPS Connected
                  </div>
                </div>
              </div>
            ) : (
              /* Prior to Out for Delivery: Show Order Preparation Progress Card */
              <div
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '20px',
                  border: '1px solid #ECE7DF',
                  padding: '2.5rem 2rem',
                  textAlign: 'center',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.03)'
                }}
              >
                <div
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    backgroundColor: '#FFF7ED',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.25rem',
                    fontSize: '2.2rem',
                    border: '1px solid #FED7AA'
                  }}
                >
                  🍳
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.5rem',
                    color: 'var(--brand-dark)',
                    margin: '0 0 0.5rem',
                    fontWeight: 700
                  }}
                >
                  Order in the Kitchen
                </h3>
                <p style={{ color: '#78716C', fontSize: '0.92rem', maxWidth: '420px', margin: '0 auto 1.75rem', lineHeight: 1.5 }}>
                  The chef at <strong>{order.restaurant_name || 'BIGBITES Kitchen'}</strong> is preparing your dishes fresh to order. Live GPS tracking will activate the moment your delivery partner picks up the order!
                </p>

                {/* Delivery details snapshot */}
                <div
                  style={{
                    backgroundColor: '#FDFBF7',
                    border: '1px solid #ECE7DF',
                    borderRadius: '16px',
                    padding: '1.25rem',
                    textAlign: 'left',
                    maxWidth: '440px',
                    margin: '0 auto'
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#78716C', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                    Delivery Destination
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--brand-dark)', marginBottom: '0.2rem' }}>
                    {order.delivery_address || order.delivery_location?.address || 'Connaught Place, New Delhi'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#78716C' }}>
                    Coordinates: {Number(custLat).toFixed(4)}, {Number(custLng).toFixed(4)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.8; }
        }
        @media (max-width: 900px) {
          .order-track-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
