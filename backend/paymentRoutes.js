const express = require('express');
const router = express.Router();
const PaymentService = require('./PaymentService');
const { PaymentError } = require('./utils/ErrorHandler');
const logger = require('./utils/logger');

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
router.post('/create-session', async (req, res) => {
  try {
    const { amount, orderId, customerDetails } = req.body;

    // Validate input
    if (!amount || !orderId || !customerDetails) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    const session = await PaymentService.createPaymentSession({
      amount,
      orderId,
      customerDetails
    });

    res.json({
      status: 'success',
      data: session
    });
  } catch (error) {
    console.error('Payment session creation failed:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to create payment session'
    });
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

// Webhook handler
router.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['x-cashfree-signature'];
    const paymentData = await PaymentService.handleWebhook(req.body, signature);
    
    res.json({
      status: 'success',
      data: paymentData
    });
  } catch (error) {
    next(error);
  }
});

// Apply error handler
router.use(errorHandler);

module.exports = router;