class PaymentError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = "PaymentError";
    this.code = code;
    this.details = details;
  }
}

const ERROR_CODES = {
  INITIALIZATION_ERROR: 'INITIALIZATION_ERROR',
  PAYMENT_CREATION_FAILED: 'PAYMENT_CREATION_FAILED',
  INVALID_ORDER_DETAILS: 'INVALID_ORDER_DETAILS',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  INVALID_WEBHOOK_SIGNATURE: 'INVALID_WEBHOOK_SIGNATURE'
};

module.exports = {
  PaymentError,
  ERROR_CODES
};