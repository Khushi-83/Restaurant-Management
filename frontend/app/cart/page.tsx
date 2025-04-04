'use client';

import { useCart } from '@/contexts/cartContext';
import Link from 'next/link';
import Image from 'next/image';


export default function CartPage() {
  const { cart, removeFromCart, clearCart, totalItems, totalPrice } = useCart();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart ({totalItems})</h1>
      
      {cart.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl mb-4">Your cart is empty</p>
          <Link href="/menu" className="text-blue-600 hover:underline">
            Browse our menu
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {cart.map(item => (
              <div key={item.id} className="flex items-start border-b pb-4">
                {/* Updated Image Container */}
                <div className="w-24 h-24 relative bg-gray-100 rounded-md overflow-hidden">
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">₹{item.price} × {item.quantity}</p>
                  <p className="text-gray-800 font-medium">₹{item.price * (item.quantity ?? 1)}</p>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold">₹{totalPrice}</span>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={clearCart}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Clear Cart
              </button>
              <Link
                href="/checkout"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex-1 text-center"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}