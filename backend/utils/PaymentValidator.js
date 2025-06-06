// utils/PaymentValidator.jsAdd commentMore actions

const { Cashfree } = require('cashfree-pg');
const { PaymentError, ERROR_CODES } = require('./ErrorHandler');

/**
 * Validates payment payloads and webhook signatures for Cashfree.
 */
class PaymentValidator {
  static validateAmount(amount) {
    if (typeof amount !== 'number' || amount <= 0 || isNaN(amount)) {
      throw new PaymentError(
        'Invalid payment amount',
        ERROR_CODES.INVALID_AMOUNT,
        { amount }
      );
    }





  }

  static validateCustomerDetails(orderPayload) {
    const cd = orderPayload.customer_details;

    if (!cd || typeof cd !== 'object') {
      throw new PaymentError(
        'Missing customer_details object',
        ERROR_CODES.MISSING_CUSTOMER_DETAILS
      );










    }

    const { customerName, customerEmail, customerPhone, tableNo } = cd;
    const missing = [];















    if (!customerName?.trim()) missing.push('customerName');
    if (!customerEmail?.trim()) missing.push('customerEmail');
    if (!customerPhone?.trim()) missing.push('customerPhone');
    if (!tableNo) missing.push('tableNo');

    if (missing.length) {
      throw new PaymentError(
        'Missing required customer_details fields',
        ERROR_CODES.MISSING_CUSTOMER_DETAILS,
        { missingFields: missing }
      );
    }
  }

  static validateOrderMeta(orderPayload) {
    const meta = orderPayload.order_meta;

    if (!meta || typeof meta !== 'object') {
      throw new PaymentError(
        'Missing order_meta object',
        ERROR_CODES.INVALID_DATA
      );
    }

    const { return_url, notify_url, payment_methods } = meta;
    const missing = [];

    if (!return_url) missing.push('return_url');
    if (!notify_url) missing.push('notify_url');

    if (missing.length) {
      throw new PaymentError(
        'Missing required order_meta fields',
        ERROR_CODES.INVALID_DATA,
        { missingFields: missing }
      );
    }

    if (payment_methods && typeof payment_methods !== 'string') {
      throw new PaymentError(
        'payment_methods must be a string',
        ERROR_CODES.INVALID_DATA
      );
    }
  }

  static validateOrderPayload(orderPayload) {
    if (!orderPayload || typeof orderPayload !== 'object') {
      throw new PaymentError(
        'Invalid or missing order payload',
        ERROR_CODES.INVALID_ORDER_DETAILS
      );
    }

    this.validateAmount(orderPayload.order_amount);
    this.validateCustomerDetails(orderPayload);
    this.validateOrderMeta(orderPayload);


  }


  static validateWebhookSignature(rawBody, signature) {
    if (!signature) {
      throw new PaymentError(
        'Missing webhook signature',
        ERROR_CODES.INVALID_WEBHOOK_SIGNATURE
      );
    }

    try {
      const verified = Cashfree.WebhookValidator.verify({
        signature,
        rawBody,
      });

      if (!verified) {
        throw new PaymentError(
          'Webhook signature verification failed',
          ERROR_CODES.INVALID_WEBHOOK_SIGNATURE
        );
      }
    } catch (err) {
      throw new PaymentError(
        'Webhook signature validation error',
        ERROR_CODES.INVALID_WEBHOOK_SIGNATURE,
        { originalError: err.message }
      );
    }
  }
}

module.exports = PaymentValidator;