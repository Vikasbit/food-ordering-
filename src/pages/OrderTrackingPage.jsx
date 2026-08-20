import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderTrackingModal from '../components/OrderTrackingModal';
import { useCart } from '../context/CartContext';

export default function OrderTrackingPage() {
  const navigate = useNavigate();
  const { deliveryLocation, lastOrderItems, cartItems } = useCart();
  
  const itemsToTrack = lastOrderItems.length > 0 ? lastOrderItems : cartItems;

  useEffect(() => {
    // If no items to track, maybe user shouldn't be here, but we allow it for demo
    if (itemsToTrack.length === 0) {
      // console.warn("No items to track");
    }
  }, [itemsToTrack]);

  return (
    <div style={{ minHeight: '80vh' }}>
      <OrderTrackingModal
        isOpen={true}
        onClose={() => navigate('/')}
        deliveryLocation={deliveryLocation}
        cartItems={itemsToTrack}
      />
    </div>
  );
}
