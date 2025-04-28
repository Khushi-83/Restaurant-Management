import { NextResponse } from 'next/server';
import { CartItem } from '@/types/types';

interface PaymentInitiateRequest {
  amount: number;
  customerDetails: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
  };
  cartItems: CartItem[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as PaymentInitiateRequest;
    const { amount, customerDetails, cartItems } = body;

    // Generate a unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderId,
        amount,
        customerDetails,
        cartItems,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create payment session');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment initiation failed' },
      { status: 500 }
    );
  }
}