require("dotenv").config();
const { Cashfree } = require("cashfree-pg");

// Initialize client
const cf = new Cashfree({
  env: process.env.CASHFREE_ENV || "TEST",
  clientId: process.env.CASHFREE_APP_ID,
  clientSecret: process.env.CASHFREE_SECRET_KEY,
});

const createPaymentSession = async ({ orderId, amount, tableNo, customerName = "Guest" }) => {
  try {
    const order = {
      order_id: `RESTRO-${Date.now()}-${tableNo}`,
      order_amount: amount,
      order_currency: "INR",
      order_note: `Table ${tableNo} - ${customerName}`,
      customer_details: {
        customer_id: `table-${tableNo}`,
        customer_name: customerName,
        customer_phone: "9999999999", // Placeholder
        customer_email: "guest@example.com" // Required in some cases
      }
    };

    const { data } = await cf.orders.create(order);
    return {
      paymentSessionId: data.payment_session_id,
      orderId: order.order_id
    };

  } catch (err) {
    console.error("Payment session creation failed:", err.response?.data || err.message);
    throw new Error("Failed to create payment session");
  }
};

const handleWebhook = async (payload, signature) => {
  try {
    // You’ll need to manually verify signature or use cf.webhooks.verify when available
    // Add your custom verification logic here

    const tableNoMatch = payload.order_note?.match(/Table (\w+)/);
    const tableNo = tableNoMatch ? tableNoMatch[1] : "unknown";

    return {
      orderId: payload.order_id,
      tableNo,
      status: payload.order_status === "PAID" ? "PAID" : "FAILED",
      amount: payload.order_amount,
      paymentId: payload.cf_payment_id,
      paymentMethod: payload.payment_method
    };

  } catch (err) {
    console.error("Webhook processing failed:", err);
    throw err;
  }
};

module.exports = {
  createPaymentSession,
  handleWebhook
};
