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
  };
}

export default function CheckoutButton({ cartItems, amount, customerDetails }: CheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const initializePayment = async () => {
    try {
      setIsLoading(true);

      // Validate customer details
      if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
        alert('Please provide complete customer details.');
        setIsLoading(false);
        return;
      }

      const orderResponse = await fetch('/api/payments/initiate', {
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
          },
          cartItems,
        }),
      });

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