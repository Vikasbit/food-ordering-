import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import MainLayout from './layouts/MainLayout';
import SellerLayout from './layouts/SellerLayout';

// Customer Pages
import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import RestaurantPage from './pages/RestaurantPage';

// Seller Pages
import SellerLoginPage from './pages/seller/SellerLoginPage';
import SellerRegisterPage from './pages/seller/SellerRegisterPage';
import RestaurantSetupPage from './pages/seller/RestaurantSetupPage';
import SellerDashboardPage from './pages/seller/SellerDashboardPage';
import SellerRestaurantPage from './pages/seller/SellerRestaurantPage';
import SellerMenuPage from './pages/seller/SellerMenuPage';
import SellerOrdersPage from './pages/seller/SellerOrdersPage';
import RestaurantPreviewPage from './pages/seller/RestaurantPreviewPage';
import SellerSettingsPage from './pages/seller/SellerSettingsPage';
import DriverSimulatorPage from './pages/dev/DriverSimulatorPage';

import './styles/globals.css';
import './styles/animations.css';

import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Customer Routes */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<HomePage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="order/:id" element={<OrderConfirmationPage />} />
              <Route path="orders/:orderId/track" element={<OrderConfirmationPage />} />
              <Route path="restaurant/:id" element={<RestaurantPage />} />
              <Route
                path="/dev/driver"
                element={
                  <ProtectedRoute allowedRoles={['delivery_partner', 'admin', 'seller']}>
                    <DriverSimulatorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/driver"
                element={
                  <ProtectedRoute allowedRoles={['delivery_partner', 'admin', 'seller']}>
                    <DriverSimulatorPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="orders"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Seller Auth Routes (No layout/sidebar) */}
            <Route path="/seller/login" element={<SellerLoginPage />} />
            <Route path="/seller/register" element={<SellerRegisterPage />} />
            <Route
              path="/seller/restaurant/setup"
              element={
                <ProtectedRoute allowedRoles={['seller', 'admin']}>
                  <RestaurantSetupPage />
                </ProtectedRoute>
              }
            />

            {/* Seller Dashboard Routes (With sidebar) */}
            <Route
              path="/seller"
              element={
                <ProtectedRoute allowedRoles={['seller', 'admin']}>
                  <SellerLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<SellerDashboardPage />} />
              <Route path="restaurant" element={<SellerRestaurantPage />} />
              <Route path="menu" element={<SellerMenuPage />} />
              <Route path="orders" element={<SellerOrdersPage />} />
              <Route path="preview" element={<RestaurantPreviewPage />} />
              <Route path="settings" element={<SellerSettingsPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
