import { useState } from 'react';
import CustomCursor from './components/CustomCursor';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import IntroSection from './components/IntroSection';
import DishesSection from './components/DishesSection';
import MenuSection from './components/MenuSection';
import BigTypeSection from './components/BigTypeSection';
import JourneySection from './components/JourneySection';
import IngredientsSection from './components/IngredientsSection';
import StorySection from './components/StorySection';
import KitchenSection from './components/KitchenSection';
import CommunitySection from './components/CommunitySection';
import LocationsSection from './components/LocationsSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

import CartDrawer from './components/CartDrawer';
import DishModal from './components/DishModal';
import ExploreAllModal from './components/ExploreAllModal';
import LocationPickerModal from './components/LocationPickerModal';
import OrderTrackingModal from './components/OrderTrackingModal';
import DishCustomizerModal from './components/DishCustomizerModal';
import PaymentGatewayModal from './components/PaymentGatewayModal';
import OrderHistoryModal from './components/OrderHistoryModal';

import './styles/globals.css';
import './styles/animations.css';

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);
  const [paymentGatewayOpen, setPaymentGatewayOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  
  const [selectedDish, setSelectedDish] = useState(null);
  const [customizingDish, setCustomizingDish] = useState(null);
  const [ordersHistory, setOrdersHistory] = useState([]);
  
  const [deliveryLocation, setDeliveryLocation] = useState({
    address: 'Connaught Place, Inner Circle, New Delhi 110001',
    lat: 28.6139,
    lon: 77.2090,
    label: 'HOME'
  });

  const [cartItems, setCartItems] = useState([
    { id: 'palak-paneer', name: 'PALAK PANEER', price: '₹290', quantity: 1 }
  ]);

  const handleAddToCart = (dish) => {
    const dishId = dish.id || dish.name.toLowerCase().replace(/\s+/g, '-');
    const existing = cartItems.find((item) => item.id === dishId);
    if (existing) {
      setCartItems(
        cartItems.map((item) =>
          item.id === dishId ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      setCartItems([
        ...cartItems,
        {
          id: dishId,
          name: dish.name,
          price: dish.price,
          quantity: dish.quantity || 1
        }
      ]);
    }
    setCartOpen(true);
  };

  const handleRemoveItem = (id) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
    } else {
      setCartItems(
        cartItems.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handlePaymentSuccess = (newOrder) => {
    setOrdersHistory([newOrder, ...ordersHistory]);
    setCartItems([]);
    setOrderTrackingOpen(true);
  };

  const handleReorder = (itemsToReorder) => {
    if (itemsToReorder && itemsToReorder.length > 0) {
      setCartItems([...cartItems, ...itemsToReorder]);
      setCartOpen(true);
    }
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div style={{ backgroundColor: 'var(--cream)', color: 'var(--black)', minHeight: '100vh', position: 'relative' }}>
      <CustomCursor />
      <Navbar
        onOpenCart={() => setCartOpen(true)}
        cartCount={totalCartCount}
        onOpenOrders={() => setOrderHistoryOpen(true)}
      />
      
      <main>
        <Hero
          onOpenCart={() => setCartOpen(true)}
          onOpenLocationPicker={() => setLocationPickerOpen(true)}
          deliveryLocation={deliveryLocation}
          onOpenOrderTracking={() => setOrderTrackingOpen(true)}
        />
        <IntroSection />
        
        {/* FOOD DELIVERY FIRST: Signature Dishes & Interactive Menu */}
        <DishesSection
          onSelectDish={(dish) => setSelectedDish(dish)}
          onAddToCart={handleAddToCart}
          onCustomizeDish={(dish) => setCustomizingDish(dish)}
        />
        <MenuSection
          onAddToCart={handleAddToCart}
          onOpenCart={() => setCartOpen(true)}
          onOpenExplore={() => setExploreOpen(true)}
          onCustomizeDish={(dish) => setCustomizingDish(dish)}
        />
        
        <BigTypeSection />
        <JourneySection />
        <IngredientsSection />
        <StorySection />
        <KitchenSection />
        <CommunitySection />
        <LocationsSection />
        <CTASection />
      </main>

      <Footer />

      {/* Cart Side Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onPlaceOrder={() => setPaymentGatewayOpen(true)}
      />

      {/* Dish Inspection Modal */}
      <DishModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Full Catalog Explorer Modal */}
      <ExploreAllModal
        isOpen={exploreOpen}
        onClose={() => setExploreOpen(false)}
        onAddToCart={handleAddToCart}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        currentAddress={deliveryLocation.address}
        onSaveLocation={(newLoc) => setDeliveryLocation(newLoc)}
      />

      {/* Order Tracking & Live Driver Map Modal */}
      <OrderTrackingModal
        isOpen={orderTrackingOpen}
        onClose={() => setOrderTrackingOpen(false)}
        deliveryLocation={deliveryLocation}
        cartItems={cartItems}
      />

      {/* Dish Customizer Modal */}
      <DishCustomizerModal
        dish={customizingDish}
        isOpen={!!customizingDish}
        onClose={() => setCustomizingDish(null)}
        onAddToCart={handleAddToCart}
      />

      {/* Indian Payment Gateway Checkout Modal */}
      <PaymentGatewayModal
        isOpen={paymentGatewayOpen}
        onClose={() => setPaymentGatewayOpen(false)}
        cartItems={cartItems}
        deliveryLocation={deliveryLocation}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Order History & GST Tax Invoice Modal */}
      <OrderHistoryModal
        isOpen={orderHistoryOpen}
        onClose={() => setOrderHistoryOpen(false)}
        orders={ordersHistory}
        onReorder={handleReorder}
      />
    </div>
  );
}
