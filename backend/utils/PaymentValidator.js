const { PaymentError, ERROR_CODES } = require('./ErrorHandler');

class PaymentValidator {
  static validateAmount(amount) {
    if (!amount || amount <= 0 || typeof amount !== 'number') {
      throw new PaymentError(
        'Invalid payment amount',
        ERROR_CODES.INVALID_AMOUNT,
        { amount }
      );
    }
  }

  static validateOrderDetails(orderDetails) {
    const requiredFields = ['orderId', 'amount', 'tableNo'];
    const missingFields = requiredFields.filter(field => !orderDetails[field]);
    
    if (missingFields.length > 0) {
      throw new PaymentError(
        'Missing required fields',
        ERROR_CODES.PAYMENT_CREATION_FAILED,
        { missingFields }
      );
    }
  }

  static validateWebhookSignature(payload, signature) {
    if (!signature) {
      throw new PaymentError(
        'Missing webhook signature',
        ERROR_CODES.INVALID_WEBHOOK_SIGNATURE
      );
    }
    // Add Cashfree specific signature validation here
  }
}

module.exports = PaymentValidator;