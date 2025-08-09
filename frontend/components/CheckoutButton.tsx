'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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

  const placeOrder = async () => {
    try {
      setIsLoading(true);
      const { tableNo } = customerDetails;

      if (!amount || isNaN(amount) || amount <= 0) {
        alert('Order amount must be greater than zero.');
        setIsLoading(false);
        return;
      }
      if (!cartItems || cartItems.length === 0) {
        alert('Your cart is empty.');
        setIsLoading(false);
        return;
      }
      if (!tableNo || isNaN(tableNo)) {
        alert('Please provide a valid table number.');
        setIsLoading(false);
        return;
      }

      const payload = {
        amount,
        customerDetails,
        cartItems,
        // Provide explicit payment fields for legacy backends
        paymentMethod: 'none',
        payment_method: 'none',
        payment_status: 'N/A'
      };

      // Use internal Next.js API to create the order directly, no payment
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());

      alert('Order placed successfully!');
      if (typeof window !== 'undefined') {
        window.location.href = '/orderstatus';
      }
    } catch (e: unknown) {
      console.error('Order placement error:', e);
      alert(e instanceof Error ? e.message : 'Failed to place order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={placeOrder}
        disabled={isLoading}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Placing...
          </span>
        ) : 'Place Order'}
      </Button>
    </>
  );
}