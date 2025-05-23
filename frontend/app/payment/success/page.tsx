"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";

// Simple confetti effect using canvas-confetti (if available)
function Confetti() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#16a34a", "#facc15", "#f87171"],
        });
      });
    }
  }, []);
  return null;
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-100 px-4 relative overflow-hidden">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-10 select-none" aria-hidden>
        <svg width="100%" height="100%" className="h-full w-full">
          <defs>
            <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="2" fill="#22c55e" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>
      <Confetti />
      <div className="bg-white/90 rounded-3xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center relative z-10 border border-green-100">
        <div className="animate-bounce mb-4">
          <CheckCircle2 className="h-20 w-20 text-green-500 drop-shadow-lg" />
        </div>
        <h1 className="text-4xl font-extrabold text-green-700 mb-2 text-center">Payment Successful!</h1>
        <p className="text-gray-700 text-center mb-4 text-lg">
          Thank you for your payment.<br />
          Your order has been <span className="font-semibold text-green-600">confirmed</span> and is being prepared!
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl px-6 py-3 mb-6 text-green-800 text-center text-base shadow-sm">
          You can track your order status in real time.<br />
          If you need help, our staff is always nearby!
        </div>
        <Link href="/orderstatus">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg shadow-lg text-lg transition-all">
            View Order Status
          </button>
        </Link>
        <Link href="/">
          <button className="mt-4 text-green-700 underline hover:text-green-900 text-base">Back to Home</button>
        </Link>
      </div>
    </div>
  );
} 