'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  tableNo: string;
};

type CartContextType = {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  notification?: string;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  showNotification: (message: string) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [notification, setNotification] = useState<string>();

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      const newCart = existing
        ? prev.map(i => 
            i.id === item.id 
              ? { ...i, quantity: i.quantity + 1 } 
              : i
          )
        : [...prev, { ...item, quantity: 1 }];
      
      showNotification(existing 
        ? `${item.name} quantity updated` 
        : `${item.name} added to cart`);
      
      return newCart;
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (item) {
        setNotification(`${item.name} removed from cart`);
      }
      return prev.filter(item => item.id !== id);
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    
    setCart(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, quantity } 
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    showNotification('Cart cleared');
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(undefined), 3000);
  };

  return (
    <CartContext.Provider value={{
      cart,
      totalItems: cart.reduce((count, item) => count + item.quantity, 0),
      totalPrice: cart.reduce((total, item) => total + item.price * item.quantity, 0),
      notification,
      addToCart,
      removeFromCart,
      clearCart,
      updateQuantity,
      showNotification
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}