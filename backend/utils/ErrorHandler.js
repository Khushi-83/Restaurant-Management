class PaymentError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.details = details;
  }
}

const ERROR_CODES = {
  PAYMENT_CREATION_FAILED: 'PAYMENT_001',
  PAYMENT_VERIFICATION_FAILED: 'PAYMENT_002',
  INVALID_WEBHOOK_SIGNATURE: 'PAYMENT_003',
  ORDER_UPDATE_FAILED: 'PAYMENT_004',
  INVALID_AMOUNT: 'PAYMENT_005',
  INVALID_CURRENCY: 'PAYMENT_006',
  NETWORK_ERROR: 'PAYMENT_007',
  DATABASE_ERROR: 'PAYMENT_008'
};

module.exports = {
  PaymentError,
  ERROR_CODES
}; 