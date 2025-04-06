// app/order/page.tsx
'use client';
import { useState } from 'react';
import { useCart } from '@/contexts/cartContext';
import CheckoutButton from '@/components/CheckoutButton';

export default function Page() {
  const { cart, totalPrice } = useCart();
  const [tableNo, setTableNo] = useState('');
  const [customerName, setCustomerName] = useState('');

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Complete Your Order</h1>

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">
            Table Number *
          </label>
          <input
            type="text"
            value={tableNo}
            onChange={(e) => setTableNo(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="e.g., A12"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">
            Your Name (Optional)
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="For order reference"
          />
        </div>

        <div className="border-t pt-4">
          <h2 className="font-bold mb-2">Your Order</h2>
          <ul className="divide-y">
            {cart.map(item => (
              <li key={item.id} className="py-2 flex justify-between">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between font-bold text-lg mt-4 pt-2 border-t">
            <span>Total</span>
            <span>₹{totalPrice}</span>
          </div>
        </div>

        <CheckoutButton
          tableNo={tableNo}
          customerName={customerName}
          cartTotal={totalPrice}
          cartItems={cart}
        />
      </div>
    </div>
  );
}