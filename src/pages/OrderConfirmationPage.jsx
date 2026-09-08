import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService, driverService, marketplaceService } from '../lib/supabase';
import GoogleMapsView from '../components/GoogleMapsView';
import { calculateDistance } from '../utils/geo';
import { formatINR } from '../utils/currency';

/**
 * Modern Food-Delivery Order Tracking Screen (Zomato/Swiggy UX Pattern)
 * - Compact top header (56px) with restaurant name, chevron, share button
 * - Bold status header with dynamic ETA pill and circular refresh button
 * - Full-bleed 2D Google Map with restaurant, scooter rider, home pins and route
 * - Floating recenter button
 * - Modern white bottom sheet with drag handle, delivery details, COD pending badge,
 *   distance/ETA, cash-payment reminder, and order summary
 * - Autonomous demo simulation fallback with Supabase Realtime support
 */
export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.orderId || params.id;
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [driverLocation, setDriverLocation] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showItemsDetails, setShowItemsDetails] = useState(false);

  const simIntervalRef = useRef(null);
  const simStepRef = useRef(0);
  const totalSimSteps = 40;

  // 1. Fetch Order & Restaurant Data
  const fetchOrderData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      let data = null;
      try {
        data = await orderService.getOrderById(orderId);
      } catch (e) {
        console.warn('Supabase fetch error, fallback to local:', e);
      }

      if (!data) {
        // Fallback to localStorage
        const all = JSON.parse(localStorage.getItem('bigbites_db_orders') || '[]');
        data = all.find((o) => o.id === orderId) || all[all.length - 1] || null;
      }

      if (data) {
        setOrder(data);

        // Fetch corresponding restaurant if restaurant_id exists
        if (data.restaurant_id) {
          try {
            const rest = await marketplaceService.getRestaurantById(data.restaurant_id);
            if (rest) setRestaurant(rest);
          } catch (err) {
            console.warn('Restaurant load error:', err);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setLoading(false);
      if (isManualRefresh) {
        setTimeout(() => setIsRefreshing(false), 600);
      }
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderData();

    // Subscribe to order changes in Supabase
    const unsubscribeOrder = orderService.subscribeToOrder(orderId, (updatedOrder) => {
      if (updatedOrder) {
        setOrder((prev) => ({ ...prev, ...updatedOrder }));
      }
    });

    return () => {
      if (unsubscribeOrder) unsubscribeOrder();
    };
  }, [orderId, fetchOrderData]);

  // 2. Resolve Coordinates
  const restLat = restaurant?.lat || order?.restaurant_lat || 22.2887;
  const restLng = restaurant?.lng || order?.restaurant_lng || 73.3638;
  const restName = restaurant?.name || order?.restaurant_name || 'BIGBITES Express Kitchen';

  const custLat = order?.delivery_latitude || order?.delivery_lat || order?.delivery_location?.lat || order?.delivery_location?.latitude || (restLat + 0.022);
  const custLng = order?.delivery_longitude || order?.delivery_lng || order?.delivery_location?.lng || order?.delivery_location?.longitude || (restLng + 0.028);
  const custAddress = order?.delivery_address || order?.delivery_location?.address || order?.delivery_location?.formatted_address || 'Delivery Address';

  // 3. Driver Location & Realtime / Simulator
  useEffect(() => {
    if (!order) return;

    const currentStatus = (order.status || 'CONFIRMED').toUpperCase().replace(/\s+/g, '_');
    const isDelivered = currentStatus === 'DELIVERED';

    if (isDelivered) {
      // Driver at customer home
      setDriverLocation({
        latitude: custLat,
        longitude: custLng,
        heading: 0,
        driverName: order.driver_name || 'Rider Ramesh Kumar'
      });
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
      return;
    }

    // Subscribe to Realtime Driver location
    let unsubDriver = null;
    try {
      unsubDriver = driverService.subscribeToDriverLocation(order.id, (loc) => {
        if (loc && (loc.latitude || loc.lat)) {
          // If live driver GPS is active, use it and stop simulator
          if (simIntervalRef.current) clearInterval(simIntervalRef.current);
          setDriverLocation({
            latitude: loc.latitude || loc.lat,
            longitude: loc.longitude || loc.lng,
            heading: loc.heading || 0,
            driverName: order.driver_name || 'Rider Ramesh Kumar'
          });
        }
      });
    } catch (e) {
      console.warn('Driver subscription notice:', e);
    }

    // Autonomous Academic Simulator fallback
    // Progresses smoothly from restaurant coordinates to customer coordinates
    if (!driverLocation) {
      setDriverLocation({
        latitude: restLat,
        longitude: restLng,
        heading: 45,
        driverName: order.driver_name || 'Rider Ramesh Kumar'
      });
    }

    const dLatStep = (custLat - restLat) / totalSimSteps;
    const dLngStep = (custLng - restLng) / totalSimSteps;
    const initialHeading = Math.round((Math.atan2(custLng - restLng, custLat - restLat) * 180) / Math.PI);

    simIntervalRef.current = setInterval(() => {
      simStepRef.current += 1;
      const progress = Math.min(1, simStepRef.current / totalSimSteps);

      const curLat = restLat + dLatStep * simStepRef.current;
      const curLng = restLng + dLngStep * simStepRef.current;

      setDriverLocation({
        latitude: curLat,
        longitude: curLng,
        heading: initialHeading,
        driverName: order.driver_name || 'Rider Ramesh Kumar'
      });

      if (progress >= 1) {
        clearInterval(simIntervalRef.current);
        setOrder((prev) => (prev ? { ...prev, status: 'DELIVERED' } : prev));
      }
    }, 2200);

    return () => {
      if (unsubDriver) unsubDriver();
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [order?.id, order?.status, restLat, restLng, custLat, custLng]);

  // 4. Dynamic Distance & ETA Calculation
  const currentDriverLat = driverLocation?.latitude || restLat;
  const currentDriverLng = driverLocation?.longitude || restLng;
  const distanceKm = Math.max(0, calculateDistance(currentDriverLat, currentDriverLng, custLat, custLng));
  const etaMinutes = order?.status === 'DELIVERED' ? 0 : Math.max(2, Math.round((distanceKm / 18) * 60 + 2));

  // 5. Order Status Text Logic
  const currentStatusUpper = (order?.status || 'CONFIRMED').toUpperCase().replace(/\s+/g, '_');
  const isDelivered = currentStatusUpper === 'DELIVERED';
  const isPreparing = currentStatusUpper === 'PREPARING';
  const isReady = currentStatusUpper === 'READY_FOR_PICKUP';
  const isOutForDelivery = ['OUT_FOR_DELIVERY', 'PICKED_UP', 'DRIVER_ASSIGNED'].includes(currentStatusUpper);
  const isCOD = (order?.payment_method || '').toUpperCase() === 'COD';

  let statusHeading = 'Order is on the way';
  if (isDelivered) {
    statusHeading = 'Order delivered';
  } else if (isPreparing) {
    statusHeading = 'Preparing your order';
  } else if (isReady) {
    statusHeading = 'Ready for pickup';
  } else if (!isOutForDelivery) {
    statusHeading = 'Order confirmed';
  }

  // 6. Share Functionality
  const handleShare = async () => {
    const shareData = {
      title: `Track BigBites Order #${order?.id}`,
      text: `Track my BigBites order from ${restName}!`,
      url: window.location.href
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User dismissed
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setToastMessage('Order tracking link copied to clipboard!');
        setTimeout(() => setToastMessage(''), 3000);
      } catch (err) {
        setToastMessage('Order link ready.');
        setTimeout(() => setToastMessage(''), 2000);
      }
    }
  };

  // Loading State
  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem', animation: 'spin 1s linear infinite' }}>↻</div>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.25rem', fontWeight: 700, color: '#1F2937', margin: 0 }}>
          Locating your delivery...
        </h2>
      </div>
    );
  }

  // Error / Not Found State
  if (!order) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', margin: '0 0 0.5rem' }}>
          Order not found
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.95rem', maxWidth: '360px', margin: '0 0 1.75rem' }}>
          We could not locate this order. It may have expired or was placed in a different session.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#EA580C',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '0.95rem',
            padding: '0.85rem 1.75rem',
            borderRadius: '9999px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '70px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#1F2937',
            color: '#FFFFFF',
            padding: '8px 18px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* ========================================================
          1. COMPACT MOBILE-FIRST TOP HEADER (56px)
          ======================================================== */}
      <header
        style={{
          height: '56px',
          minHeight: '56px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 40,
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}
      >
        {/* Left: Back Arrow */}
        <button
          type="button"
          onClick={() => navigate('/orders')}
          aria-label="Back to orders"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#F9FAFB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#111827'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        {/* Center: Restaurant Name + Dropdown Chevron */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            maxWidth: '65%',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (restaurant?.id) navigate(`/restaurant/${restaurant.id}`);
          }}
        >
          <span
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#111827',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {restName}
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Right: Share Icon */}
        <button
          type="button"
          onClick={handleShare}
          aria-label="Share order tracking"
          title="Share order"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: '#F9FAFB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#111827'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </header>

      {/* ========================================================
          2. ORDER STATUS HEADER (Large bold heading, ETA pill, ↻)
          ======================================================== */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          padding: '14px 20px 16px',
          borderBottom: '1px solid #F3F4F6',
          zIndex: 30,
          textAlign: 'center'
        }}
      >
        <h1
          style={{
            fontSize: 'clamp(20px, 4vw, 24px)',
            fontWeight: 800,
            color: '#111827',
            margin: '0 0 8px',
            letterSpacing: '-0.02em'
          }}
        >
          {statusHeading}
        </h1>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {/* Status/ETA Pill */}
          <div
            style={{
              backgroundColor: '#F3F4F6',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isDelivered ? '#16A34A' : '#EA580C'
              }}
            />
            {isDelivered ? 'Order Delivered' : `${etaMinutes} mins • On time`}
          </div>

          {/* Circular Refresh Button */}
          <button
            type="button"
            onClick={() => fetchOrderData(true)}
            aria-label="Refresh order status"
            title="Refresh order"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#4B5563',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'transform 0.2s ease'
            }}
          >
            <span
              style={{
                display: 'inline-block',
                transform: isRefreshing ? 'rotate(360deg)' : 'none',
                transition: isRefreshing ? 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                fontSize: '15px'
              }}
            >
              ↻
            </span>
          </button>
        </div>
      </section>

      {/* ========================================================
          3. MAIN MAP CONTAINER (Large 2D Google Map)
          ======================================================== */}
      <div
        style={{
          position: 'relative',
          flex: 1,
          width: '100%',
          minHeight: '260px'
        }}
      >
        <GoogleMapsView
          kitchenLocation={{ lat: restLat, lng: restLng, name: restName }}
          customerLocation={{ lat: custLat, lng: custLng, address: custAddress }}
          driverLocation={driverLocation}
          showRoute={true}
          interactive={true}
          height="100%"
          minHeight="100%"
          showRecenterBtn={true}
        />
      </div>

      {/* ========================================================
          4. MODERN WHITE BOTTOM SHEET (Delivery Details, COD, Amount)
          ======================================================== */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          boxShadow: '0 -6px 25px rgba(0,0,0,0.09)',
          padding: '12px 20px 24px',
          zIndex: 35,
          position: 'relative',
          maxHeight: '44vh',
          overflowY: 'auto'
        }}
      >
        {/* Drag Handle Bar */}
        <div
          style={{
            width: '38px',
            height: '4px',
            backgroundColor: '#E5E7EB',
            borderRadius: '2px',
            margin: '0 auto 12px'
          }}
        />

        {/* Header Row: Delivery Details & Payment Method Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}
        >
          <div>
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 800,
                color: '#111827',
                margin: '0 0 2px'
              }}
            >
              Delivery details
            </h2>
            <p
              style={{
                fontSize: '12px',
                color: '#6B7280',
                margin: 0
              }}
            >
              {restName} → Home
            </p>
          </div>

          {/* Payment Badge */}
          {isCOD ? (
            <div
              style={{
                backgroundColor: '#FEF3C7',
                color: '#92400E',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textAlign: 'right'
              }}
            >
              CASH ON DELIVERY
            </div>
          ) : (
            <div
              style={{
                backgroundColor: '#DCFCE7',
                color: '#166534',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}
            >
              PAID ONLINE (UPI)
            </div>
          )}
        </div>

        {/* Key Info Card: Order ID & Total */}
        <div
          style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #F3F4F6',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
              ORDER ID
            </span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
              #{order.id}
            </span>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block' }}>
              TOTAL
            </span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827' }}>
              {formatINR(order.amount || order.grand_total || 0)}
            </span>
          </div>
        </div>

        {/* Live Delivery Status / Distance Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 0',
            borderTop: '1px solid #F3F4F6',
            borderBottom: '1px solid #F3F4F6',
            marginBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#FFF7ED',
                color: '#EA580C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '17px'
              }}
            >
              {isDelivered ? '🎉' : '🛵'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                {isDelivered ? 'Order delivered successfully' : 'Delivery partner is moving toward you'}
              </div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                {isDelivered ? 'Delivered to your doorstep' : `Estimated arrival: ${etaMinutes} mins`}
              </div>
            </div>
          </div>

          {!isDelivered && (
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#111827' }}>
              {distanceKm.toFixed(1)} km
            </div>
          )}
        </div>

        {/* COD Explicit Cash Payment Callout */}
        {isCOD && !isDelivered && (
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '12px'
            }}
          >
            <span style={{ fontSize: '18px' }}>💵</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400E' }}>
              Pay cash to the delivery partner when your order arrives.
            </span>
          </div>
        )}

        {/* Driver Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 0 10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px'
              }}
            >
              👨‍🦱
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>
                {order.driver_name || 'Rider Ramesh Kumar'}
              </div>
              <div style={{ fontSize: '11px', color: '#6B7280' }}>
                Hero Electric Scooter • ★ 4.9
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert(`Calling delivery partner: +91 98765 43210`)}
            aria-label="Call driver"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: '#DCFCE7',
              color: '#15803D',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </button>
        </div>

        {/* Collapsible Items Summary */}
        {order.items && order.items.length > 0 && (
          <div style={{ marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => setShowItemsDetails((v) => !v)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderTop: '1px solid #F3F4F6',
                background: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                borderBottom: 'none',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 700,
                color: '#4B5563'
              }}
            >
              <span>{order.items.length} item{order.items.length > 1 ? 's' : ''} in this order</span>
              <span>{showItemsDetails ? '▲ Hide' : '▼ View'}</span>
            </button>

            {showItemsDetails && (
              <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {order.items.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4B5563' }}>
                    <span>{item.quantity}x {item.name}</span>
                    <span style={{ fontWeight: 600 }}>{formatINR((item.price || 0) * (item.quantity || 1))}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
