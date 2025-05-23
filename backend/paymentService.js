// PaymentService.js

require("dotenv").config();
const { Cashfree } = require("cashfree-pg");
const { PaymentError, ERROR_CODES } = require("./utils/ErrorHandler");
const logger = require("./utils/logger");

class PaymentService {
  constructor() {
    try {
      if (!process.env.CASHFREE_APP_ID || !process.env.CASHFREE_SECRET_KEY) {
        throw new Error("Missing Cashfree credentials");
      }

      // Choose environment
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

  /**  
   * orderPayload must include:
   * - order_id, order_amount, order_currency, order_note  
   * - customer_details: { customer_id, customer_name, customer_email, customer_phone }  
   * - order_meta: { return_url, notify_url, payment_methods }
   */
  async createPaymentSession(orderPayload) {
    try {
      // Ensure required keys exist
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

      // Always enforce payment_methods to 'upi' only
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

      return {
        orderId: payload.order_id,
        status: payload.order_status,
        amount: payload.order_amount,
        paymentId: payload.cf_payment_id,
        tableNo: payload.order_note.match(/Table (\d+)/)?.[1] || null
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
