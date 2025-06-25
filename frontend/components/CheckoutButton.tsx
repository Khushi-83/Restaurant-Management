'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import Script from 'next/script';
import { CartItem } from '@/types/types';

interface CheckoutButtonProps {
  cartItems: CartItem[];
  amount: number;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    tableNo: number;
  };
}

export default function CheckoutButton({
  cartItems,
  amount,
  customerDetails
}: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const initializePayment = async () => {
    try {
      setIsLoading(true);

      const { name, email, phone, tableNo } = customerDetails;
      if (!name || !email || !phone || !tableNo) {
        alert('Please fill in all customer details.');
        return;
      }

      // Generate a simple order ID
      const orderId = `RESTRO-${Date.now()}-${tableNo}`;

      const payload = {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          table_number: tableNo
        },
        order_meta: {
          return_url: `${window.location.origin}/payment/status?order_id=${orderId}`,
          notify_url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/webhook`,
          payment_methods: 'upi'
        },
        cart_items: cartItems.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create payment session');
      }

      const { paymentSessionId } = await res.json();

      if (!window.Cashfree) {
        throw new Error('Cashfree SDK not loaded');
      }

      window.Cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox',
      });
    } catch (e: unknown) {
      console.error('Payment initialization error:', e);
      alert(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="lazyOnload"
        onError={() => alert('Failed to load Cashfree SDK. Please reload.')}
      />
      <Button
        onClick={initializePayment}
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        {isLoading ? 'Processing…' : 'Pay Now'}
      </Button>
    </>
  );
}