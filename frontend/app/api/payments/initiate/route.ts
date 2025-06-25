import { NextResponse } from 'next/server';
import { CartItem } from '@/types/types';

interface PaymentInitiateRequest {
  amount: number;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    tableNo: number;
  };
  cartItems: CartItem[];
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as PaymentInitiateRequest;
    const { amount, customerDetails, cartItems } = body;
    const { name, email, phone, tableNo } = customerDetails;

    // Generate a unique order ID
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
        return_url: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/payment/status?order_id=${orderId}`,
        notify_url: `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/webhook`,
        payment_methods: 'upi'
      },
      cart_items: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payments/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required authentication headers here
        // 'Authorization': `Bearer ${process.env.BACKEND_API_KEY}`
      },
      body: JSON.stringify(payload)
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