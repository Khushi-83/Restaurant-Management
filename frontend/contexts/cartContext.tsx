// contexts/CartContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';

type FoodItem = {
  id: number;
  name: string;
  price: number;
  image_url: string;
  quantity?: number;
};

type CartContextType = {
  cart: FoodItem[];
  addToCart: (item: FoodItem) => void;
  removeFromCart: (itemId: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  notification: string | null;
  showNotification: (message: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<FoodItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  const addToCart = (item: FoodItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: (cartItem.quantity || 1) + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    showNotification(`${item.name} added to cart!`);
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const clearCart = () => setCart([]);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems: cart.reduce((total, item) => total + (item.quantity || 1), 0),
    totalPrice: cart.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0),
    notification,
    showNotification
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}