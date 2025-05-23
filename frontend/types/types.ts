export type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image_url?: string;
  category?: string;
  tableNo: string;
};

export type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

declare global {
  interface Window {
    Cashfree: {
      initialize?: (options: {
        paymentSessionId: string;
        returnUrl: string;
        paymentModes?: {
          upi?: { flow: 'intent' | 'collect' };
          card?: {
            channel?: 'link' | 'redirection';
            savedCards?: boolean;
          };
          netbanking?: Record<string, never>;
          wallet?: Record<string, never>;
        };
      }) => void;
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: '_self' | '_blank' | '_top' | '_modal' | HTMLElement;
        mode?: 'sandbox' | 'production';
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

