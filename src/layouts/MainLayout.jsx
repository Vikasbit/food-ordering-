import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CustomCursor from '../components/CustomCursor';
import CartDrawer from '../components/CartDrawer';
import CustomerAuthModal from '../components/CustomerAuthModal';
import SellerAuthModal from '../components/seller/SellerAuthModal';
import LocationPickerModal from '../components/LocationPickerModal';
import OrderHistoryModal from '../components/OrderHistoryModal';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function MainLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    cartItems, 
    handleRemoveItem, 
    handleUpdateQuantity, 
    deliveryLocation,
    isLocationModalOpen,
    openLocationModal,
    closeLocationModal
  } = useCart();

  const [cartOpen, setCartOpen] = useState(false);
  const [customerAuthOpen, setCustomerAuthOpen] = useState(false);
  const [sellerAuthOpen, setSellerAuthOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-[var(--cream)] text-[var(--black)] selection:bg-[var(--red)] selection:text-[var(--white)] overflow-x-hidden">
      <CustomCursor />
      
      <Navbar
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setCartOpen(true)}
        onOpenOrders={() => setOrderHistoryOpen(true)}
        deliveryLocation={deliveryLocation}
        onOpenLocationPicker={openLocationModal}
        onOpenAuth={() => setCustomerAuthOpen(true)}
        onOpenSellerPortal={() => {
          if (user?.role === 'seller' || user?.role === 'admin') {
            navigate('/seller/dashboard');
          } else {
            setSellerAuthOpen(true);
          }
        }}
        currentUser={user}
      />

      <main style={{ minHeight: 'calc(100vh - 400px)' }}>
        <Outlet />
      </main>

      <Footer onOpenSellerPortal={() => {
        if (user?.role === 'seller' || user?.role === 'admin') {
          navigate('/seller/dashboard');
        } else {
          setSellerAuthOpen(true);
        }
      }} />

      {/* Global Modals */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        onOpenCheckout={() => {
          setCartOpen(false);
          navigate('/checkout');
        }}
      />
      
      <CustomerAuthModal
        isOpen={customerAuthOpen}
        onClose={() => setCustomerAuthOpen(false)}
      />
      
      <SellerAuthModal
        isOpen={sellerAuthOpen}
        onClose={() => setSellerAuthOpen(false)}
      />

      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
        currentLocation={deliveryLocation}
        onSelectLocation={(loc) => {}}
      />

      <OrderHistoryModal
        isOpen={orderHistoryOpen}
        onClose={() => setOrderHistoryOpen(false)}
      />
    </div>
  );
}
