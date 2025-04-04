// components/Cart.tsx
'use client';

import { useCart } from '@/contexts/cartContext';

const Cart = () => {
  const { 
    cart, 
    removeFromCart, 
    clearCart, 
    totalItems, 
    totalPrice 
  } = useCart();

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border w-80">
      <h2 className="text-xl font-bold mb-4">Your Cart ({totalItems})</h2>
      
      {cart.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          <ul className="space-y-2 mb-4">
            {cart.map(item => (
              <li key={item.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-500 ml-2">
                    (x{item.quantity}) - ₹{item.price * item.quantity}
                  </span>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
          
          <div className="border-t pt-2">
            <p className="font-bold">Total: ₹{totalPrice}</p>
            <button 
              onClick={clearCart}
              className="mt-2 bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              Clear Cart
            </button>
            <button className="mt-2 ml-2 bg-green-500 text-white px-3 py-1 rounded text-sm">
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;