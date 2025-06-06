const express = require('express');
const router = express.Router();
const PaymentService = require('../PaymentService');
const { PaymentError, ERROR_CODES } = require('./utils/ErrorHandler');
const logger = require('./utils/logger');
const PaymentValidator = require('./utils/PaymentValidator');
const { Cashfree } = require('cashfree-pg');

// Middleware to handle errors
const errorHandler = (err, req, res, next) => {
  logger.error('Payment error occurred', {
    error: err.message,
    code: err.code,
    details: err.details
  });

  if (err instanceof PaymentError) {
    return res.status(400).json({
      status: 'error',
      code: err.code,
      message: err.message,
      details: err.details
    });
  }

  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  });
};

// Create payment session
router.post("/initiate", async (req, res, next) => {
  try {
    const { amount, cartItems, customerDetails } = req.body;
    const { name: customerName, email: customerEmail, phone: customerPhone, tableNo } = customerDetails || {};

    // Validation
    if (!amount || isNaN(amount)) throw new PaymentError("Valid amount is required", ERROR_CODES.INVALID_AMOUNT);
    if (!Array.isArray(cartItems)) throw new PaymentError("Cart items must be an array", ERROR_CODES.INVALID_DATA);
    if (!customerName || !customerEmail || !customerPhone || !tableNo) {
      throw new PaymentError("Missing customer details", ERROR_CODES.MISSING_CUSTOMER_DETAILS);
    }

    const orderPayload = {
      order_id: `RESTRO-${Date.now()}-${tableNo}`,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: `cust-${Date.now()}`,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/payment/success?order_id={order_id}`,
        notify_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
        payment_methods: 'upi'
      }
    };

    // Validate order payload
    PaymentValidator.validateOrderPayload(orderPayload);

    const session = await PaymentService.createPaymentSession(orderPayload);
    res.json(session);
  } catch (err) {
    next(err);
  }
});

// Webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res, next) => {
  try {
    const signature = req.headers['x-cf-signature'];
    const rawBody = req.body.toString();
    const parsed = JSON.parse(rawBody);

    // Validate webhook signature
    PaymentValidator.validateWebhookSignature(rawBody, signature);

    const result = await PaymentService.handleWebhook(parsed, signature);
    
    res.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// Verify payment status
router.get('/verify/:orderId', async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const paymentStatus = await PaymentService.verifyPayment(orderId);
    
    res.json({
      status: 'success',
      data: paymentStatus
    });
  } catch (error) {
    next(error);
  }
});

// Apply error handler
router.use(errorHandler);

module.exports = router;