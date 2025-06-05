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
        "order_note",
        "customer_details",
        "order_meta"
      ].forEach((k) => {
        if (!orderPayload[k]) throw new Error(`Missing field: ${k}`);
      });

      orderPayload.order_meta.payment_methods = 'upi';

      const resp = await this.retryOperation(() =>
        this.client.pg.orders.create(orderPayload)
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
   * - Validate Signature
   * - Parse data
   * - Update Supabase 'orders'
   * - Return enriched data for broadcasting
   */
  async handleWebhook(payload, signature) {
    try {
      if (
        !Cashfree.WebhookValidator.verify(
          payload,
          signature,
          process.env.CASHFREE_SECRET_KEY
        )
      ) {
        throw new Error("Invalid webhook signature");
      }

      const orderId = payload.order_id;
      const paymentId = payload.cf_payment_id;
      const status = payload.order_status;
      const amount = payload.order_amount;
      const tableNo = payload.order_note.match(/Table (\d+)/)?.[1] || null;

      // Update order in Supabase
      const { data, error } = await supabase
        .from("orders")
        .update({
          payment_status: status,
          status: status === "PAID" ? "Preparing" : "Payment Failed",
          cf_payment_id: paymentId,
          updated_at: new Date().toISOString()
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
