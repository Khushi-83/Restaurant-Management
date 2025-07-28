'use client';

import { CartProvider, useCart } from '@/contexts/cartContext';
import Notification from "@/components/Notifications";
import 'antd/dist/reset.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <html lang="en">
        <head>
          <title>Restaurant Admin</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body className="h-screen bg-gray-50">
          {children}
          <NotificationWrapper />
        </body>
      </html>
    </CartProvider>
  );
}

// Notification wrapper component
function NotificationWrapper() {
  const { notification, showNotification } = useCart();

  return (
    <Notification 
      message={notification || ""} 
      show={!!notification} 
      onClose={() => showNotification("")} 
    />
  );
} 