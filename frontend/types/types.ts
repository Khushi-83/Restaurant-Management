// src/types/types.ts

export type CartItem = {
  id: string; // Changed from number to string to match your DB
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
  category?: string;
};

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

// ✅ Corrected Cashfree window extension (no `new Cashfree()`)
declare global {
  interface Window {
    Cashfree: {
      initialize: (options: {
        paymentSessionId: string;
        returnUrl: string;
        paymentModes?: {
          upi?: { flow: 'intent' | 'collect' };
          card?: {
            channel?: 'link' | 'redirection';
            savedCards?: boolean;
          };
        };
      }) => void;
    };
  }
}

export type Order = {
  id: string;
  table_number: string;
  items: CartItem[];
  total_price: number;
  status: 'pending' | 'paid' | 'failed';
};
