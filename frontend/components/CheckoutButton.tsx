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
    tableNo: string;
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

      // de-dupe table numbers just in case
      const uniqueCartItems = cartItems.filter((item, idx, arr) =>
        idx === arr.findIndex((t) => t.tableNo === item.tableNo)
      );

      // build the new payload shape
      const payload = {
        amount,
        cartItems: uniqueCartItems,
        customer_details: {
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          tableNo
        },
        order_meta: {
          return_url: `${window.location.origin}/payment/status?order_id={order_id}`,
          notify_url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/webhook`,
          payment_methods: 'cc,dc,nb,upi,wallet'
        }
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

      const { paymentSessionId, orderId } = await res.json();

      if (!paymentSessionId) {
        throw new Error('No paymentSessionId returned');
      }

      if (!window.Cashfree) {
        throw new Error('Cashfree SDK not loaded');
      }

      window.Cashfree.initialize({
        paymentSessionId,
        returnUrl: `${window.location.origin}/payment/status?order_id=${orderId}`,
        paymentModes: {
          upi: { flow: 'intent' },
          card: { channel: 'link' },
          netbanking: {},
          wallet: {}
        }
      });
    } catch (e: unknown) {
      console.error('Payment initialization error:', e);
      if (e instanceof Error) {
        alert(e.message || 'Payment failed');
      } else {
        alert('Payment failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="lazyOnload"
        onError={() => {
          alert('Failed to load Cashfree SDK. Please reload.');
        }}
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
