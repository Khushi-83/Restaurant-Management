import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return NextResponse.json(
        { error: 'Backend URL is not configured' },
        { status: 500 }
      );
    }

    // Ensure legacy backend requirements are satisfied even if not needed now
    const customerDetails = body?.customerDetails || {};
    const sanitizedBody = {
      amount: body?.amount,
      cartItems: Array.isArray(body?.cartItems) ? body.cartItems : [],
      customerDetails: {
        name: (customerDetails.name || 'Guest').toString(),
        email: (customerDetails.email || 'guest@example.com').toString(),
        phone: (customerDetails.phone || '0000000000').toString(),
        tableNo: Number(customerDetails.tableNo) || 0,
      },
      // Send both camelCase and snake_case for maximum backend compatibility
      paymentMethod: (body?.paymentMethod || 'none').toString(),
      payment_method: (body?.payment_method || body?.paymentMethod || 'none').toString(),
      payment_status: (body?.payment_status || 'N/A').toString(),
    };

    const res = await fetch(`${backendUrl}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitizedBody)
    });

    const text = await res.text();
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = text; }

    return new NextResponse(typeof data === 'string' ? data : JSON.stringify(data), {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' }
    });
  } catch (error) {
    console.error('Order proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 