import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

const STORAGE_LOCATION_KEY = 'bigbites_customer_delivery_location';

const DEFAULT_LOCATION = {
  address: 'Connaught Place, Inner Circle, New Delhi 110001',
  lat: 28.6315,
  lng: 77.2167,
  city: 'DELHI',
  label: 'HOME',
  placeId: 'ChIJde1fAeq4DDkR_0J5e8z1G2c'
};

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [activeCartRestaurant, setActiveCartRestaurant] = useState(null);
  const [lastOrderItems, setLastOrderItems] = useState([]);
  
  const [deliveryLocation, setDeliveryLocationState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LOCATION_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return DEFAULT_LOCATION;
  });

  const setDeliveryLocation = (loc) => {
    if (!loc) {
      setDeliveryLocationState(null);
      try {
        localStorage.removeItem(STORAGE_LOCATION_KEY);
      } catch (e) {}
      return;
    }

    const numericLat = Number(loc.lat ?? loc.latitude);
    const numericLng = Number(loc.lng ?? loc.longitude);

    const normalizedLoc = {
      ...loc,
      lat: isNaN(numericLat) ? 28.6315 : numericLat,
      lng: isNaN(numericLng) ? 77.2167 : numericLng,
      latitude: isNaN(numericLat) ? 28.6315 : numericLat,
      longitude: isNaN(numericLng) ? 77.2167 : numericLng,
      address: loc.address || loc.formatted_address || 'Delivery Location',
      formatted_address: loc.formatted_address || loc.address || 'Delivery Location'
    };

    setDeliveryLocationState(normalizedLoc);
    try {
      localStorage.setItem(STORAGE_LOCATION_KEY, JSON.stringify(normalizedLoc));
    } catch (e) {
      // ignore
    }
  };

  const handleAddToCart = (item) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += (item.quantity || 1);
        return copy;
      }
      const rawPriceNum = typeof item.price === 'number' ? item.price : parseFloat(item.price?.toString().replace(/[^0-9.]/g, '') || '0');
      return [
        ...prev,
        {
          ...item,
          price: typeof item.price === 'string' && item.price.startsWith('$') ? item.price : `$${rawPriceNum.toFixed(2)}`,
          rawPrice: rawPriceNum,
          quantity: item.quantity || 1
        }
      ];
    });
  };

  const handleAddToCartFromRestaurant = (item, rest) => {
    setActiveCartRestaurant(rest);
    const rawPriceNum = typeof item.price === 'number' ? item.price : parseFloat(item.price?.toString().replace(/[^0-9.]/g, '') || '0');
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const copy = [...prev];
        copy[existingIndex].quantity += 1;
        return copy;
      }
      return [...prev, { ...item, price: `$${rawPriceNum.toFixed(2)}`, rawPrice: rawPriceNum, quantity: 1 }];
    });
  };

  const handleClearAndAddToCart = (item, rest) => {
    setActiveCartRestaurant(rest);
    const rawPriceNum = typeof item.price === 'number' ? item.price : parseFloat(item.price?.toString().replace(/[^0-9.]/g, '') || '0');
    setCartItems([{ ...item, price: `$${rawPriceNum.toFixed(2)}`, rawPrice: rawPriceNum, quantity: 1 }]);
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

  const clearCart = () => {
    setLastOrderItems([...cartItems]); // snapshot
    setCartItems([]);
    setActiveCartRestaurant(null);
  };

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => setIsLocationModalOpen(false);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        activeCartRestaurant,
        lastOrderItems,
        deliveryLocation,
        setDeliveryLocation,
        isLocationModalOpen,
        openLocationModal,
        closeLocationModal,
        handleAddToCart,
        handleAddToCartFromRestaurant,
        handleClearAndAddToCart,
        handleUpdateQuantity,
        handleRemoveItem,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
