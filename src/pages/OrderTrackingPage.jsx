import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GoogleMapsView from '../components/GoogleMapsView';
import { useCart } from '../context/CartContext';
import { realtimeTracker } from '../services/realtimeTracker';

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { deliveryLocation, lastOrderRestaurant } = useCart();
  const [driverState, setDriverState] = useState(null);

  const restaurant = useMemo(() => {
    return routeLocation.state?.restaurant || lastOrderRestaurant || {
      id: 'kitchen-1',
      name: 'BIGBITES Flagship Kitchen',
      lat: 28.6315,
      lng: 77.2167,
      address: 'Connaught Place, New Delhi'
    };
  }, [routeLocation.state, lastOrderRestaurant]);

  const customer = useMemo(() => ({
    lat: Number(deliveryLocation?.lat ?? deliveryLocation?.latitude ?? 28.6315),
    lng: Number(deliveryLocation?.lng ?? deliveryLocation?.longitude ?? 77.2167),
    label: deliveryLocation?.label || 'HOME',
    address: deliveryLocation?.address || 'Delivery Address'
  }), [deliveryLocation]);

  const kitchen = useMemo(() => ({
    lat: Number(restaurant.lat ?? restaurant.latitude ?? 28.6315),
    lng: Number(restaurant.lng ?? restaurant.longitude ?? 77.2167),
    name: restaurant.name || 'Restaurant',
    address: restaurant.address || restaurant.location || 'Restaurant'
  }), [restaurant]);

  const orderId = routeLocation.pathname.split('/').filter(Boolean).pop() || 'current-order';

  useEffect(() => {
    const unsubscribe = realtimeTracker.subscribe(orderId, 'driver_location_updated', setDriverState);
    realtimeTracker.startDevSimulator(orderId, kitchen, customer, setDriverState);

    return () => {
      unsubscribe();
      realtimeTracker.stopDevSimulator(orderId);
    };
  }, [orderId, kitchen, customer]);

  return (
    <div style={{ minHeight: '100vh', background: '#F7F5F0', padding: '1rem' }}>
      <div style={{ maxWidth: '1200px', height: 'calc(100vh - 2rem)', minHeight: '620px', margin: '0 auto', background: '#fff', borderRadius: '18px', overflow: 'hidden', border: '1px solid #E7E2D9', boxShadow: '0 12px 40px rgba(0,0,0,0.08)', position: 'relative' }}>
        <GoogleMapsView
          customerLocation={customer}
          kitchenLocation={kitchen}
          driverLocation={driverState}
          showRoute={true}
          interactive={true}
          height="100%"
          minHeight="620px"
        />

        <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', pointerEvents: 'none' }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '14px 16px', boxShadow: '0 5px 20px rgba(0,0,0,0.12)', maxWidth: '420px', pointerEvents: 'auto' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#78716C', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Delivery Tracking</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#1C1917', marginTop: '3px' }}>🛵 Restaurant → Home</div>
            <div style={{ fontSize: '0.8rem', color: '#57534E', marginTop: '4px' }}>
              {driverState ? `Driver is moving • ${driverState.distanceRemainingKm ?? '—'} km remaining` : 'Driver is being assigned…'}
            </div>
          </div>
          <button type="button" onClick={() => navigate('/')} style={{ pointerEvents: 'auto', border: 'none', borderRadius: '12px', background: '#fff', padding: '10px 14px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 5px 20px rgba(0,0,0,0.12)' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
