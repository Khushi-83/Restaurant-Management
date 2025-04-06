// app/payment-status/page.tsx
'use client';
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PaymentStatus() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableNo = searchParams.get('table');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/payments/verify?table=${tableNo}`);
        const { status } = await res.json();
        
        if (status === 'success') {
          localStorage.removeItem('cart');
        }
      } catch (error) {
        console.error("Verification failed:", error);
      }
    };

    if (tableNo) verifyPayment();
  }, [tableNo]);

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">
        {tableNo ? `Table ${tableNo}` : 'Payment'} Status
      </h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p>Processing your payment...</p>
        <button
          onClick={() => router.push(tableNo ? `/table/${tableNo}` : '/')}
          className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {tableNo ? 'Back to Table' : 'Return Home'}
        </button>
      </div>
    </div>
  );
}