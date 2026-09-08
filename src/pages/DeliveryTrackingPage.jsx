import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import GoogleMapsView from '../components/GoogleMapsView';
import { calculateDistance } from '../utils/geo';

export default function DeliveryTrackingPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const { deliveryLocation, lastOrderRestaurant } = useCart();

  const restaurant = location.state?.restaurant || lastOrderRestaurant || {
    id: 'kitchen-1',
    name: 'BIGBITES Flagship Kitchen',
    lat: 28.6315,
    lng: 77.2167,
    address: 'Connaught Place, New Delhi'
  };

  const customer = useMemo(() => ({
    lat: Number(deliveryLocation?.lat ?? deliveryLocation?.latitude ?? 28.6315),
    lng: Number(deliveryLocation?.lng ?? deliveryLocation?.longitude ?? 77.2167),
    label: deliveryLocation?.label || 'HOME',
    address: deliveryLocation?.address || 'Delivery Address'
  }), [deliveryLocation]);

  const kitchen = useMemo(() => ({
    lat: Number(restaurant.lat ?? restaurant.latitude ?? 28.6315),
    lng: Number(restaurant.lng ?? restaurant.longitude ?? 77.2167),
    name: restaurant.name || 'BIGBITES Restaurant',
    address: restaurant.address || ''
  }), [restaurant]);

  const [driver, setDriver] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    setDriver(null);

    const startedAt = Date.now();
    const duration = 30000;

    const timer = window.setInterval(() => {
      const nextProgress = Math.min((Date.now() - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - nextProgress, 3);
      const lat = kitchen.lat + (customer.lat - kitchen.lat) * eased;
      const lng = kitchen.lng + (customer.lng - kitchen.lng) * eased;
      const heading = (Math.atan2(customer.lng - kitchen.lng, customer.lat - kitchen.lat) * 180 / Math.PI + 360) % 360;
      const remainingKm = calculateDistance(lat, lng, customer.lat, customer.lng);

      setProgress(nextProgress);
      setDriver({
        latitude: lat,
        longitude: lng,
        heading,
        driverName: 'BIGBITES Delivery Partner',
        distanceRemainingKm: Number(remainingKm.toFixed(1)),
        speedKmH: 28
      });

      if (nextProgress >= 1) window.clearInterval(timer);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [kitchen.lat, kitchen.lng, customer.lat, customer.lng]);

  const distanceKm = calculateDistance(kitchen.lat, kitchen.lng, customer.lat, customer.lng);
  const etaMinutes = Math.max(2, Math.round((distanceKm / 22) * 60));
  const status = progress >= 1 ? 'Delivered' : progress > 0 ? 'On the way' : 'Driver assigned';

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#FBF9F5', position: 'relative' }}>
      <GoogleMapsView
        customerLocation={customer}
        kitchenLocation={kitchen}
        driverLocation={driver}
        showRoute={true}
        interactive={true}
        height="100vh"
        minHeight="100vh"
      />

      <div style={{
        position: 'absolute',
        top: '18px',
        left: '18px',
        zIndex: 10,
        background: '#FFFFFF',
        border: '1px solid #E7E2DA',
        borderRadius: '14px',
        padding: '12px 16px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        maxWidth: '320px'
      }}>
        <div style={{ fontWeight: 800, color: '#1C1917', fontSize: '15px' }}>🛵 {status}</div>
        <div style={{ color: '#78716C', fontSize: '12px', marginTop: '3px' }}>
          Order #{orderId} • {progress >= 1 ? 'Arrived at destination' : `~${etaMinutes} min`}
        </div>
      </div>
    </div>
  );
}
