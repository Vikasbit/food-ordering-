import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [activeCartRestaurant, setActiveCartRestaurant] = useState(null);
  const [lastOrderItems, setLastOrderItems] = useState([]);
  const [deliveryLocation, setDeliveryLocation] = useState(null);

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
  };

  const handleClearAndAddToCart = (item, rest) => {
    setActiveCartRestaurant(rest);
    setCartItems([{ ...item, price: `₹${item.price}`, rawPrice: item.price, quantity: 1 }]);
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

  return (
    <CartContext.Provider
      value={{
        cartItems,
        activeCartRestaurant,
        lastOrderItems,
        deliveryLocation,
        setDeliveryLocation,
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
