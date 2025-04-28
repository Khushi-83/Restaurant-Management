'use client';
import { useState } from 'react';
import { useCart } from '@/contexts/cartContext';
import CheckoutButton from '@/components/CheckoutButton';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from 'lucide-react';

export default function Page() {
  const { cart, totalPrice } = useCart();

  const [tableNo, setTableNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <Badge className="bg-red-200 text-red-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
            Processing Your Order
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-gray-900 mb-4">
            Finalize Your Dining Experience
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Almost there! Just a few details to complete your order.
          </p>
        </div>

        <div className="space-y-8">
          {/* Customer Details */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" />
                Order Details
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Table Number *
                  </label>
                  <input
                    type="text"
                    value={tableNo}
                    onChange={(e) => setTableNo(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., A12"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Your Name 
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="For order reference"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="e.g. john@example.com"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              <div className="divide-y">
                {cart.map(item => (
                  <div key={item.id} className="py-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.name} × {item.quantity}</p>
                    </div>
                    <span className="font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-medium">₹{totalPrice}</span>
                </div>
                <div className="flex justify-between items-center mt-2 text-gray-600">
                  <span>Service Charge</span>
                  <span>₹0</span>
                </div>
                <div className="flex justify-between items-center mt-2 text-gray-600">
                  <span>Tax</span>
                  <span>₹0</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-4 border-t text-lg font-bold">
                <span>Total</span>
                <span className="text-red-600">₹{totalPrice}</span>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Button */}
          <div className="pt-4">
            <CheckoutButton
              cartItems={cart}
              amount={totalPrice}
              customerDetails={{
                name: customerName,
                email: customerEmail,
                phone: customerPhone,
                tableNo: tableNo
              }}
            />
          </div>

          {/* Assurance Message */}
          <div className="text-center text-sm text-gray-500 mt-8">
            <p>Your order will be prepared immediately after confirmation.</p>
            <p className="mt-1">Need help? Ask our staff for assistance.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
