class PaymentError extends Error {
  constructor(message, code, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

const ERROR_CODES = {
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  PAYMENT_CREATION_FAILED: 'PAYMENT_CREATION_FAILED',
  INVALID_WEBHOOK_SIGNATURE: 'INVALID_WEBHOOK_SIGNATURE',
  PAYMENT_VERIFICATION_FAILED: 'PAYMENT_VERIFICATION_FAILED'
};

module.exports = { PaymentError, ERROR_CODES }; 