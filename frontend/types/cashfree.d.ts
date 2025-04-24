declare namespace Cashfree {
    interface CustomerDetails {
      customerId?: string;
      customerName: string;
      customerEmail: string;
      customerPhone: string;
    }
  
    interface OrderMeta {
      returnUrl?: string;
      notifyUrl?: string;
      paymentMethods?: string;
    }
  
    interface Order {
      orderId: string;
      orderAmount: number;
      orderCurrency: string;
      customerDetails: CustomerDetails;
      orderMeta?: OrderMeta;
    }
  
    interface PaymentResponse {
      order: {
        orderId: string;
        orderAmount: number;
        orderCurrency: string;
        orderStatus: string;
      };
      transaction: {
        txnId: string;
        txnStatus: string;
        txnMessage: string;
        txnTime: string;
        txnAmount: string;
      };
    }
  
    interface CheckoutOptions {
      paymentSessionId: string;
      returnUrl?: string;
      paymentModes?: string[];
      onSuccess?: (data: PaymentResponse) => void;
      onFailure?: (data: PaymentResponse) => void;
      onClose?: () => void;
    }
  
    interface CashfreeInstance {
      checkout: (options: CheckoutOptions) => void;
    }
  
    interface CashfreeConstructor {
      new (config: { mode: 'sandbox' | 'production' }): CashfreeInstance;
    }
  }
  
  declare global {
    interface Window {
      Cashfree: Cashfree.CashfreeConstructor;
    }
  }
  
  export = Cashfree;
  export as namespace Cashfree;