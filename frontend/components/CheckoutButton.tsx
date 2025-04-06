// components/CheckoutButton.tsx
'use client';
import { useState } from 'react';
import Script from 'next/script';
import type { CartItem, PaymentStatus } from '@/types/types';

type CheckoutButtonProps = {
  tableNo: string;
  customerName: string;
  cartTotal: number;
  cartItems: CartItem[];
};

export default function CheckoutButton({
  tableNo,
  customerName,
  cartTotal,
  cartItems
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');

  const handleCheckout = async () => {
    setLoading(true);
    setPaymentStatus('processing');

    try {
      // 1. Create order
      const orderRes = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          table_number: tableNo,
          customer_name: customerName,
          items: cartItems,
          total_price: cartTotal,
          payment_method: 'online'
        })
      });

      const { order_id } = await orderRes.json();

      // 2. Initialize payment
      const paymentRes = await fetch('http://localhost:5000/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order_id,
          amount: cartTotal,
          tableNo,
          customerName
        })
      });

      const { paymentSessionId } = await paymentRes.json();

      // 3. Open Cashfree
if (window.Cashfree && typeof window.Cashfree.initialize === 'function') {
  window.Cashfree.initialize({
    paymentSessionId,
    returnUrl: `${window.location.origin}/payment-status?table=${tableNo}`,
    paymentModes: {
      upi: { flow: 'intent' },
      card: { channel: 'link' }
    }
  });
} else {
  console.error("Cashfree SDK not loaded or initialize method missing");
  setPaymentStatus('failed');
}


    } catch (error) {
      console.error("Checkout failed:", error);
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script 
        src="https://sdk.cashfree.com/js/ui/2.0.0/cashfree.prod.js" 
        strategy="afterInteractive"
      />

      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-lg text-white font-medium ${
          loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {loading ? 'Processing...' : `Pay ₹${cartTotal}`}
      </button>

      {paymentStatus === 'failed' && (
        <p className="mt-2 text-red-500 text-sm">
          Payment failed. Please try again.
        </p>
      )}
    </>
  );
}
