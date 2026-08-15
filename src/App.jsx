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

import CustomerAuthModal from './components/CustomerAuthModal';
import SellerAuthModal from './components/seller/SellerAuthModal';
import SellerDashboardModal from './components/seller/SellerDashboardModal';
import RestaurantPageModal from './components/RestaurantPageModal';

import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/globals.css';
import './styles/animations.css';

function MainAppContent() {
  const { user } = useAuth();

  const [cartOpen, setCartOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);
  const [orderTrackingOpen, setOrderTrackingOpen] = useState(false);
  const [paymentGatewayOpen, setPaymentGatewayOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);

  // New Marketplace Modals
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);
  const [sellerAuthOpen, setSellerAuthOpen] = useState(false);
  const [sellerDashboardOpen, setSellerDashboardOpen] = useState(false);
  const [restaurantPageOpen, setRestaurantPageOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [selectedDish, setSelectedDish] = useState(null);
  const [customizingDish, setCustomizingDish] = useState(null);
  const [ordersHistory, setOrdersHistory] = useState([]);

  const [deliveryLocation, setDeliveryLocation] = useState({
    address: 'Connaught Place, Inner Circle, New Delhi 110001',
    lat: 28.6315,
    lng: 77.2167,
    label: 'HOME'
  });

  // Single-Restaurant Specific Cart
  const [activeCartRestaurant, setActiveCartRestaurant] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const handleAddToCartFromRestaurant = (item, rest) => {
    setActiveCartRestaurant(rest);
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      }
      return [...prev, { ...item, price: `₹${item.price}`, rawPrice: item.price, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const handleClearAndAddToCart = (item, rest) => {
    setActiveCartRestaurant(rest);
    setCartItems([{ ...item, price: `₹${item.price}`, rawPrice: item.price, quantity: 1 }]);
    setCartOpen(true);
  };

  const handleUpdateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleCreateOrderSuccess = (newOrder) => {
    setOrdersHistory((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setPaymentGatewayOpen(false);
    setOrderTrackingOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-[var(--cream)] text-[var(--black)] selection:bg-[var(--red)] selection:text-[var(--white)] overflow-x-hidden">
      <CustomCursor />

      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setCartOpen(true)}
        onOpenOrders={() => setOrderHistoryOpen(true)}
        deliveryLocation={deliveryLocation}
        onOpenLocationPicker={() => setLocationPickerOpen(true)}
        onOpenAuth={() => setCustomerAuthOpen(true)}
        onOpenSellerPortal={() => {
          if (user?.role === 'seller' || user?.role === 'admin') {
            setSellerDashboardOpen(true);
          } else {
            setSellerAuthOpen(true);
          }
        }}
        currentUser={user}
      />

      <main>
        <Hero
          onOpenCart={() => setCartOpen(true)}
          onOpenOrderTracking={() => setOrderTrackingOpen(true)}
        />
        <IntroSection />

        <DishesSection
          onSelectDish={(dish) => setSelectedDish(dish)}
          onCustomise={(dish) => setCustomizingDish(dish)}
          onOpenRestaurantPage={(rest) => {
            setSelectedRestaurant(rest);
            setRestaurantPageOpen(true);
          }}
        />

        <MenuSection
          onSelectDish={(dish) => setSelectedDish(dish)}
          onCustomise={(dish) => setCustomizingDish(dish)}
        />

        <BigTypeSection />
        <JourneySection />
        <IngredientsSection />
        <StorySection />
        <KitchenSection />
        <CommunitySection />

        <LocationsSection
          onSelectLocation={(loc) => {
            setDeliveryLocation({
              address: loc.address || loc.name,
              lat: loc.lat,
              lng: loc.lon || loc.lng,
              label: loc.city || 'LOCATION'
            });
            setLocationPickerOpen(true);
          }}
        />

        <CTASection onOpenMenu={() => setExploreOpen(true)} />
      </main>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onOpenCheckout={() => {
          if (cartItems.length === 0) return;
          setCartOpen(false);
          setPaymentGatewayOpen(true);
        }}
      />

      {/* Dish Details Modal */}
      <DishModal
        dish={selectedDish}
        onClose={() => setSelectedDish(null)}
        onAddToCart={(dish) => {
          handleAddToCartFromRestaurant(
            {
              id: dish.id,
              name: dish.name,
              price: parseInt(dish.price.replace('₹', '')),
              is_veg: true
            },
            { id: 'rest-delhi-cp', name: 'EATnaked — Connaught Place' }
          );
          setSelectedDish(null);
        }}
      />

      {/* Customizer Modal */}
      <DishCustomizerModal
        dish={customizingDish}
        onClose={() => setCustomizingDish(null)}
        onAddToCart={(customizedItem) => {
          handleAddToCartFromRestaurant(
            {
              id: customizedItem.id,
              name: customizedItem.name,
              price: parseInt(customizedItem.price.replace('₹', '')),
              is_veg: true
            },
            { id: 'rest-delhi-cp', name: 'EATnaked — Connaught Place' }
          );
          setCustomizingDish(null);
        }}
      />

      {/* Explore Menu Modal */}
      <ExploreAllModal
        isOpen={exploreOpen}
        onClose={() => setExploreOpen(false)}
        onSelectDish={(dish) => {
          setExploreOpen(false);
          setSelectedDish(dish);
        }}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        currentAddress={deliveryLocation.address}
        onSaveLocation={(newLoc) => setDeliveryLocation(newLoc)}
        onSelectKitchen={(kitchen) => {
          setDeliveryLocation((prev) => ({ ...prev, kitchen }));
          setSelectedRestaurant(kitchen);
          setRestaurantPageOpen(true);
        }}
      />

      {/* Order Tracking Modal */}
      <OrderTrackingModal
        isOpen={orderTrackingOpen}
        onClose={() => setOrderTrackingOpen(false)}
        deliveryLocation={deliveryLocation}
        cartItems={cartItems}
      />

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal
        isOpen={paymentGatewayOpen}
        onClose={() => setPaymentGatewayOpen(false)}
        deliveryLocation={deliveryLocation}
        cartItems={cartItems}
        onPaymentSuccess={handleCreateOrderSuccess}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={orderHistoryOpen}
        onClose={() => setOrderHistoryOpen(false)}
        orders={ordersHistory}
        onTrackOrder={() => {
          setOrderHistoryOpen(false);
          setOrderTrackingOpen(true);
        }}
      />

      {/* Customer Auth Modal */}
      <CustomerAuthModal
        isOpen={customerAuthOpen}
        onClose={() => setCustomerAuthOpen(false)}
        onSwitchToSeller={() => setSellerAuthOpen(true)}
      />

      {/* Seller Partner Auth Modal */}
      <SellerAuthModal
        isOpen={sellerAuthOpen}
        onClose={() => setSellerAuthOpen(false)}
        onOpenDashboard={() => setSellerDashboardOpen(true)}
      />

      {/* Seller Dashboard SaaS Portal */}
      <SellerDashboardModal
        isOpen={sellerDashboardOpen}
        onClose={() => setSellerDashboardOpen(false)}
      />

      {/* Dedicated Restaurant Page Modal */}
      <RestaurantPageModal
        isOpen={restaurantPageOpen}
        onClose={() => setRestaurantPageOpen(false)}
        restaurant={selectedRestaurant}
        cartItems={cartItems}
        activeCartRestaurant={activeCartRestaurant}
        onAddToCart={handleAddToCartFromRestaurant}
        onClearAndAddToCart={handleClearAndAddToCart}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
