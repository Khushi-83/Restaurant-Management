// paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentService = require('./PaymentService');

/**
 * @route POST /payments/initiate
 * @desc Create payment session
 */
router.post('/initiate', async (req, res) => {
  try {
    const { orderId, amount, tableNo, customerName } = req.body;
    const result = await paymentService.createPaymentSession({
      orderId,
      amount,
      tableNo,
      customerName
    });
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: "Payment initiation failed",
      details: error.message 
    });
  }
});

/**
 * @route POST /payments/webhook
 * @desc Handle payment webhook
 */
router.post('/webhook', async (req, res) => {
  try {
    const paymentData = await paymentService.handleWebhook(req.body);
    
    // Here you would typically:
    // 1. Update order status in database
    // 2. Notify kitchen/admin
    // 3. Trigger any post-payment actions
    
    res.json({ success: true, data: paymentData });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;