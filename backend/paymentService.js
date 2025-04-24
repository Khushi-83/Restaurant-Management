const { Cashfree } = require("cashfree-pg");
const { PaymentError, ERROR_CODES } = require('./utils/ErrorHandler');
const PaymentValidator = require('./utils/PaymentValidator');
const logger = require('./utils/logger');

class PaymentService {
  constructor() {
    this.cf = new Cashfree({
      env: process.env.CASHFREE_ENV || "TEST",
      clientId: process.env.CASHFREE_APP_ID,
      clientSecret: process.env.CASHFREE_SECRET_KEY,
    });

    // Retry configuration
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  async createPaymentSession(orderData) {
    try {
      // Validate input data
      PaymentValidator.validateOrderDetails(orderData);
      PaymentValidator.validateAmount(orderData.amount);

      const {
        orderId,
        amount,
        tableNo,
        customerName = "Guest",
        customerEmail,
        customerPhone
      } = orderData;

      const order = {
        order_id: `RESTRO-${Date.now()}-${tableNo}`,
        order_amount: amount,
        order_currency: "INR",
        order_note: `Table ${tableNo} - ${customerName}`,
        customer_details: {
          customer_id: `CUST-${Date.now()}`,
          customer_name: customerName,
          customer_email: customerEmail || `guest_${Date.now()}@example.com`,
          customer_phone: customerPhone || '9999999999'
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL}/payment/status?order_id={order_id}`,
          notify_url: `${process.env.BACKEND_URL}/api/payment/webhook`,
          payment_methods: "cc,dc,nb,upi,wallet"
        }
      };

      // Add order to database before creating payment
      await this.saveOrderToDatabase(order);

      const response = await this.retryOperation(
        () => this.cf.orders.create(order)
      );

      logger.info('Payment session created successfully', {
        orderId: order.order_id,
        amount: order.order_amount
      });

      return {
        paymentSessionId: response.data.payment_session_id,
        orderId: order.order_id,
        amount: order.order_amount
      };

    } catch (error) {
      logger.error('Payment session creation failed', {
        error: error.message,
        code: error.code,
        details: error.details
      });

      throw new PaymentError(
        'Failed to create payment session',
        ERROR_CODES.PAYMENT_CREATION_FAILED,
        { originalError: error.message }
      );
    }
  }

  async verifyPayment(orderId) {
    try {
      const response = await this.retryOperation(
        () => this.cf.orders.get(orderId)
      );

      const paymentStatus = {
        status: response.data.order_status,
        amount: response.data.order_amount,
        paymentId: response.data.cf_payment_id,
        paymentMethod: response.data.payment_method,
        lastUpdated: new Date().toISOString()
      };

      // Update order status in database
      await this.updateOrderStatus(orderId, paymentStatus);

      logger.info('Payment verified successfully', { orderId, ...paymentStatus });

      return paymentStatus;

    } catch (error) {
      logger.error('Payment verification failed', {
        orderId,
        error: error.message
      });

      throw new PaymentError(
        'Payment verification failed',
        ERROR_CODES.PAYMENT_VERIFICATION_FAILED,
        { orderId }
      );
    }
  }

  async handleWebhook(payload, signature) {
    try {
      // Validate webhook signature
      PaymentValidator.validateWebhookSignature(payload, signature);

      const paymentData = {
        orderId: payload.order_id,
        status: payload.order_status,
        amount: payload.order_amount,
        paymentId: payload.cf_payment_id,
        paymentMethod: payload.payment_method,
        metadata: {
          tableNo: this.extractTableNo(payload.order_note),
          customerName: payload.customer_details?.customer_name
        }
      };

      // Update order status in database
      await this.updateOrderStatus(paymentData.orderId, paymentData);

      // Emit event for real-time updates
      this.emitPaymentUpdate(paymentData);

      logger.info('Webhook processed successfully', paymentData);

      return paymentData;

    } catch (error) {
      logger.error('Webhook processing failed', {
        error: error.message,
        payload
      });

      throw new PaymentError(
        'Webhook processing failed',
        ERROR_CODES.INVALID_WEBHOOK_SIGNATURE,
        { originalError: error.message }
      );
    }
  }

  // Helper methods
  async retryOperation(operation, retryCount = 0) {
    try {
      return await operation();
    } catch (error) {
      if (retryCount < this.maxRetries && this.shouldRetry(error)) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.retryOperation(operation, retryCount + 1);
      }
      throw error;
    }
  }

  shouldRetry(error) {
    // Retry on network errors or 5xx server errors
    return error.isAxiosError || (error.response?.status >= 500);
  }

  extractTableNo(orderNote) {
    const tableNoMatch = orderNote?.match(/Table (\w+)/);
    return tableNoMatch ? tableNoMatch[1] : null;
  }

  // Database operations (implement these based on your database)
  async saveOrderToDatabase(order) {
    // Implement based on your database
    logger.info('Saving order to database', { orderId: order.order_id });
  }

  async updateOrderStatus(orderId, status) {
    // Implement based on your database
    logger.info('Updating order status', { orderId, status });
  }

  // Real-time updates (implement based on your websocket setup)
  emitPaymentUpdate(paymentData) {
    // Implement based on your websocket setup
    logger.info('Emitting payment update', paymentData);
  }
}

module.exports = new PaymentService();