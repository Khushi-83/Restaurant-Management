require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const { Cashfree } = require("cashfree-pg");
const http = require("http");
const { Server } = require("socket.io");
const paymentRoutes = require('./paymentRoutes');

const app = express();
const server = http.createServer(app);

// Enhanced CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? [process.env.FRONTEND_URL] 
      : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL 
    : "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

app.use('/api/payments', paymentRoutes);

// Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Cashfree Payment Gateway
const cf = new Cashfree({
  env: process.env.CASHFREE_ENV || "TEST",
  clientId: process.env.CASHFREE_APP_ID,
  clientSecret: process.env.CASHFREE_SECRET_KEY,
});

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "healthy",
    message: "Restaurant Management System API" 
  });
});

// Food Items Routes
app.get("/api/food-items", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("food_items")
      .select("*")
      .order("category", { ascending: true });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Food items error:", err);
    res.status(500).json({ error: "Failed to fetch food items" });
  }
});

// Order Routes
app.post("/api/orders", async (req, res) => {
  try {
    const { customer_name, table_number, items, total_price, payment_method } = req.body;
    
    const { data, error } = await supabase
      .from("orders")
      .insert([{ 
        customer_name, 
        table_number, 
        items: JSON.stringify(items), // Ensure proper serialization
        total_price,
        payment_method,
        status: payment_method === "cash" ? "Pending" : "Awaiting Payment"
      }])
      .select();

    if (error) throw error;
    
    io.emit("order_update", data[0]);
    res.status(201).json(data[0]);
    
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Payment Routes
app.post("/api/payments/initiate", async (req, res) => {
  try {
    const { orderId, amount, tableNo, customerName } = req.body;

    const order = {
      order_id: `RESTRO-${tableNo}-${orderId}`,
      order_amount: amount,
      order_currency: "INR",
      order_note: `Table ${tableNo} - ${customerName || "Guest"}`,
      customer_details: {
        customer_id: `table-${tableNo}`,
        customer_name: customerName || `Table ${tableNo} Customer`,
      }
    };

    const { payment_session_id } = await cashfree.pgOrderCreate(order);
    res.json({ paymentSessionId: payment_session_id });
    
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ 
      error: "Payment initiation failed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Webhook Route
app.post("/api/payments/webhook", express.json(), async (req, res) => {
  try {
    if (!cashfree.pgVerifyWebhook(req.body)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { order_id, order_status, cf_payment_id, payment_method } = req.body;
    
    await supabase
      .from("orders")
      .update({ 
        status: order_status === "PAID" ? "Paid" : "Failed",
        payment_id: cf_payment_id,
        payment_method
      })
      .eq("order_id", order_id);

    io.emit("payment_update", req.body);
    res.json({ success: true });
    
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

// Chat Routes (existing implementation remains the same)
app.post("/api/chat", async (req, res) => {
  try {
    const { sender, message, table_number } = req.body;
    let { data, error } = await supabase.from("chat_messages").insert([{ sender, message, table_number }]);
    if (error) throw error;
    io.emit("new_message", data);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WebSocket Connections
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
  
  socket.on("join_table", (tableNo) => {
    socket.join(`table_${tableNo}`);
    console.log(`Socket ${socket.id} joined table ${tableNo}`);
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS allowed origin: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
});