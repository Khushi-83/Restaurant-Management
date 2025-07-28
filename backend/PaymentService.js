const { createClient } = require("@supabase/supabase-js");
const { Cashfree } = require("cashfree-pg");
const { PaymentError, ERROR_CODES } = require("./utils/ErrorHandler");
const logger = require("./utils/logger");

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

class PaymentService {
  constructor() {
    try {
      if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
        throw new Error("Missing Cashfree credentials");
      }

      const env =
        (process.env.CASHFREE_ENV || "TEST").toUpperCase() === "PRODUCTION"
          ? Cashfree.PRODUCTION
          : Cashfree.SANDBOX;
 
      this.client = new Cashfree(
        env,
        process.env.CASHFREE_APP_ID,
        process.env.CASHFREE_SECRET_KEY
      );

      logger.info("Cashfree client initialized", { env });
      this.maxRetries = 3;
      this.retryDelay = 1000;
    } catch (err) {
      logger.error("PaymentService init failed", { message: err.message });
      throw new PaymentError(
        "Payment service initialization failed",
        ERROR_CODES.INITIALIZATION_ERROR,
        { originalError: err.message }
      );
    }
  }

  async createPaymentSession(orderPayload) {
    try {
      [
        "order_id",
        "order_amount",
        "order_currency",
        "customer_details",
        "order_meta"
      ].forEach((k) => {
        if (!orderPayload[k]) throw new Error(`Missing field: ${k}`);
      });


      const resp = await this.retryOperation(() =>
        this.client.orders.create(orderPayload)
      );

      return {
        paymentSessionId: resp.data.payment_session_id,
        orderId: orderPayload.order_id,
        amount: orderPayload.order_amount
      };
    } catch (err) {
      logger.error("createPaymentSession failed", { message: err.message });
      throw new PaymentError(
        "Payment session creation failed",
        ERROR_CODES.PAYMENT_CREATION_FAILED,
        { originalError: err.message }
      );
    }
  }

  /**
   * Handle Cashfree Webhook
   * - Parse data
   * - Update Supabase 'orders'
   * - Return enriched data for broadcasting
   */
  async handleWebhook(payload) {
    try {
      const orderId = payload.order_id;
      const paymentId = payload.cf_payment_id;
      const status = payload.order_status;
      const amount = payload.order_amount;
      const [prefix, timestamp, tableNo] = orderId.split('-');
      if (prefix !== 'RETRO') {
        throw new PaymentError("Invalid order ID format", ERROR_CODES.INVALID_ORDER_DETAILS);
      }
      // Update order in Supabase
      const { data, error } = await supabase
        .from("orders")
        .update({
          payment_status: status,
          status: status === "PAID" ? "Preparing" : "Payment Failed"
        })
        .eq("order_id", orderId)
        .select();

      if (error) throw error;

      logger.info("Order updated from webhook", {
        orderId,
        paymentId,
        status,
        amount
      });

      return {
        orderId,
        status,
        paymentId,
        tableNo,
        amount,
        order: data[0] || {}
      };
    } catch (err) {
      logger.error("handleWebhook failed", { message: err.message });
      throw new PaymentError(
        "Webhook processing failed",
        ERROR_CODES.INVALID_WEBHOOK_SIGNATURE,
        { originalError: err.message }
      );
    }
  }

  /**
   * Verify payment status for an order
   */
  async verifyPayment(orderId) {
    try {
      if (!orderId) {
        throw new PaymentError(
          "Order ID is required",
          ERROR_CODES.INVALID_ORDER_DETAILS
        );
      }

      // First check our database
      const { data: orderData, error: dbError } = await supabase
        .from("orders")
        .select("*")
        .eq("order_id", orderId)
        .single();

      if (dbError) throw dbError;

      // If payment is already marked as PAID in our database, return that
      if (orderData.payment_status === "PAID") {
        return {
          status: "PAID",
          order: orderData
        };
      }

      // Otherwise verify with Cashfree
      const resp = await this.retryOperation(() =>
        this.client.orders.fetch(orderId)
      );

      return {
        status: resp.data.order_status,
        order: orderData
      };
    } catch (err) {
      logger.error("verifyPayment failed", { message: err.message });
      throw new PaymentError(
        "Payment verification failed",
        ERROR_CODES.PAYMENT_VERIFICATION_FAILED,
        { originalError: err.message }
      );
    }
  }

  async retryOperation(fn, attempt = 0) {
    try {
      return await fn();
    } catch (err) {
      if (attempt < this.maxRetries) {
        await new Promise((r) => setTimeout(r, this.retryDelay));
        return this.retryOperation(fn, attempt + 1);
      }
      throw err;
    }
  }
}

module.exports = new PaymentService();
