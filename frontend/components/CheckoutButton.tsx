'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Script from 'next/script';
import { CartItem } from '@/types/types';

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  tableNo: number;
}

interface CheckoutButtonProps {
  cartItems: CartItem[];
  amount: number;
  customerDetails: CustomerDetails;
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
      
      if (!name?.trim() || !email?.trim() || !phone?.trim() || isNaN(tableNo)) {
        alert('Please fill in all customer details correctly.');
        return;
      }

      const orderId = `RETRO-${Date.now()}-${tableNo}`;
      const payload = {
        order_id: orderId,
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_name: name,
          customer_email: email,
          customer_phone: phone,
          table_number: Number(tableNo)
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

      if (!res.ok) throw new Error(await res.text());
      
      const { paymentSessionId } = await res.json();
      if (!window.Cashfree) throw new Error('Cashfree SDK not loaded');

      window.Cashfree.checkout({
        paymentSessionId,
        redirectTarget: '_self',
        mode: process.env.NEXT_PUBLIC_CASHFREE_ENV === 'production' ? 'production' : 'sandbox',
      });
    } catch (e: unknown) {
      console.error('Payment error:', e);
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
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : 'Pay Now'}
      </Button>
    </>
  );
}