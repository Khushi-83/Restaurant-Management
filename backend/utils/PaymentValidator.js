const { PaymentError, ERROR_CODES } = require('./ErrorHandler');

/**
 * Validates the shape of the order payload as sent by frontend and server:
 * - order_payload.customer_details: object with customerName, customerEmail, customerPhone, tableNo
 * - order_payload.order_meta: object with return_url, notify_url, (optional) payment_methods
 */
class PaymentValidator {
  static validateAmount(amount) {
    if (typeof amount !== 'number' || amount <= 0) {
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
        ERROR_CODES.PAYMENT_CREATION_FAILED
      );
    }
    const { customerName, customerEmail, customerPhone, tableNo } = cd;
    const missing = [];
    if (!customerName) missing.push('customerName');
    if (!customerEmail) missing.push('customerEmail');
    if (!customerPhone) missing.push('customerPhone');
    if (!tableNo) missing.push('tableNo');

    if (missing.length) {
      throw new PaymentError(
        'Missing required customer_details fields',
        ERROR_CODES.PAYMENT_CREATION_FAILED,
        { missingFields: missing }
      );
    }
  }

  static validateOrderMeta(orderPayload) {
    const meta = orderPayload.order_meta;
    if (!meta || typeof meta !== 'object') {
      throw new PaymentError(
        'Missing order_meta object',
        ERROR_CODES.PAYMENT_CREATION_FAILED
      );
    }
    const { return_url, notify_url, payment_methods } = meta;
    const missing = [];
    if (!return_url) missing.push('return_url');
    if (!notify_url) missing.push('notify_url');

    if (missing.length) {
      throw new PaymentError(
        'Missing required order_meta fields',
        ERROR_CODES.PAYMENT_CREATION_FAILED,
        { missingFields: missing }
      );
    }
    // Enforce payment_methods to be 'upi' only if present
    if (payment_methods && payment_methods !== 'upi') {
      throw new PaymentError(
        'Only UPI payment is allowed',
        ERROR_CODES.PAYMENT_CREATION_FAILED
      );
    }
  }

  static validateOrderPayload(orderPayload) {
    // amount
    this.validateAmount(orderPayload.order_amount);
    // customer details
    this.validateCustomerDetails(orderPayload);
    // order meta
    this.validateOrderMeta(orderPayload);
  }

  static validateWebhookSignature(payload, signature) {
    if (!signature) {
      throw new PaymentError(
        'Missing webhook signature',
        ERROR_CODES.INVALID_WEBHOOK_SIGNATURE
      );
    }
    // TODO: integrate Cashfree.WebhookValidator.verify here if needed
  }
}

module.exports = PaymentValidator;
