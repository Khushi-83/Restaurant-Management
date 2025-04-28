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

export default function CheckoutButton({ cartItems, amount, customerDetails }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const initializePayment = async () => {
    try {
      setIsLoading(true);

      // Validate customer details
      if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.tableNo) {
        alert('Please provide complete customer details.');
        setIsLoading(false);
        return;
      }

      // Remove duplicate table numbers from cart items
      const uniqueCartItems = cartItems.filter((item, index, self) =>
        index === self.findIndex((t) => (
          t.tableNo === item.tableNo
        ))
      );

      console.log('Initializing payment with details:', {
        amount,
        customerDetails,
        cartItems: uniqueCartItems
      });

      const orderResponse = await fetch('http://localhost:5000/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          customerDetails: {
            customerName: customerDetails.name,
            customerEmail: customerDetails.email,
            customerPhone: customerDetails.phone,
            tableNo: customerDetails.tableNo
          },
          cartItems: uniqueCartItems,
        }),
      });

      console.log('Order response status:', orderResponse.status);

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const { paymentSessionId } = await orderResponse.json();

      if (typeof window !== 'undefined' && window.Cashfree) {
        window.Cashfree.initialize({
          paymentSessionId,
          returnUrl: `${window.location.origin}/payment/status`,
          paymentModes: {
            upi: { flow: 'intent' },
            card: { channel: 'link' },
            netbanking: {},
            wallet: {}
          }
        });
      } else {
        throw new Error('Cashfree SDK not loaded');
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Payment initialization failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://sdk.cashfree.com/js/v3/cashfree.js"
        strategy="lazyOnload"
      />
      <Button
        onClick={initializePayment}
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </Button>
    </>
  );
}