// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const { Cashfree } = require("cashfree-pg");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require('helmet');
const { PaymentError, ERROR_CODES }   = require("./utils/ErrorHandler");
const PaymentValidator               = require("./utils/PaymentValidator");
const logger              = require("./utils/logger");
const paymentService = require('./PaymentService.js'); 

const app = express();
const server = http.createServer(app);

// Supabase Client (unchanged)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Socket.IO setup (unchanged)
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL.split(',')
      : ["http://localhost:3000"],
    methods: ["GET","POST"],
    credentials: true,
    allowedHeaders: ['Content-Type','Authorization']
  },
  transports: ['websocket','polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

const port = process.env.PORT || 5000;

// Middleware (unchanged)
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL.split(',')
    : "http://localhost:3000",
  methods: ['GET','POST'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  logger.info('Incoming request', { method: req.method, path: req.path, ip: req.ip });
  next();
});

// Health Check (unchanged)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Restaurant Management System API",
    websocket: io.engine.clientsCount > 0 ? "active" : "inactive"
  });
});

// Food Items Routes (unchanged)
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

// Order Routes (unchanged)
app.post("/api/orders", async (req, res) => {
  try {
    // 1. Destructure using camelCase
    const { customerDetails = {}, cartItems, amount, paymentMethod } = req.body;
    const {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      tableNo
    } = customerDetails;

    // 2. Basic validation
    if (!customerName?.trim()) {
      return res.status(400).json({ error: "Customer name is required" });
    }
    if (!tableNo) {
      return res.status(400).json({ error: "Table number is required" });
    }
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart items are required" });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Valid amount is required" });
    }
    const pm = (paymentMethod || "cash").toLowerCase();
    if (!["cash", "online"].includes(pm)) {
      return res.status(400).json({ error: "paymentMethod must be 'cash' or 'online'" });
    }

    // 3. Build DB payload (snake_case to match your table columns)
    const order = {
      customer_name: customerName.trim(),
      table_number: tableNo,
      items: JSON.stringify(cartItems),
      total_price: amount,
      payment_method: 'upi',
      status: 'Awaiting Payment',
      created_at: new Date().toISOString(),
      order_id: `ORDER-${Date.now()}-${tableNo}`
    };

    // 4. Insert and emit
    const { data, error } = await supabase
      .from("orders")
      .insert([order])
      .select();

    if (error) throw error;

    const saved = data[0];
    const itemsParsed = JSON.parse(saved.items);

    io.emit("order_update", {
      ...saved,
      event_type: "new_order",
      timestamp: new Date().toISOString(),
      items: itemsParsed
    });
    io.to(`table_${tableNo}`).emit("table_order_update", {
      ...saved,
      items: itemsParsed
    });
    io.to("admin_room").emit("admin_order_update", {
      ...saved,
      items: itemsParsed
    });

    // 5. Respond
    res.status(201).json({ ...saved, items: itemsParsed });
  } catch (err) {
    logger.error("Order error", err);
    res.status(500).json({
      error: "Failed to create order",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Payment Routes (updated for Cashfree v5)

// server.js (excerpt)

// server.js — /api/payments/initiate

app.post("/api/payments/initiate", async (req, res) => {
  try {
    // 1. Destructure exactly what your frontend sends:
    const { amount, cartItems, customerDetails, order_meta } = req.body;
    const customer_details = customerDetails; // Map camelCase to snake_case for backend
    const {
      customerName,
      customerEmail,
      customerPhone,
      tableNo
    } = customer_details || {};
    const { return_url, notify_url } = order_meta || {};

    // 2. Quick validations
    if (!amount || isNaN(amount) || amount <= 0) {
      throw new PaymentError("Valid amount is required", ERROR_CODES.INVALID_AMOUNT);
    }
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new PaymentError("Cart items are required", ERROR_CODES.PAYMENT_CREATION_FAILED);
    }
    if (!customerName || !customerEmail || !customerPhone || !tableNo) {
      throw new PaymentError("Missing customer details", ERROR_CODES.MISSING_CUSTOMER_DETAILS);
    }
    if (!return_url || !notify_url) {
      throw new PaymentError("Both return_url and notify_url are required", ERROR_CODES.PAYMENT_CREATION_FAILED);
    }

    // 3. Build the official Cashfree payload
    const orderPayload = {
      order_id: `RESTRO-${Date.now()}-${tableNo}`,
      order_amount: amount,
      order_currency: "INR",
      order_note: `Table ${tableNo} - ${customerName}`,
      customer_details, // Use snake_case for backend/validator
      order_meta: {
        return_url: "http://localhost:3000/payment/success?order_id={order_id}",
        notify_url: "http://localhost:5000/api/payments/webhook",
        payment_methods: 'upi'
      }
    };

    // 4. Delegate to your PaymentService
    const session = await paymentService.createPaymentSession(orderPayload);

    // 5. Return the session info
    res.json(session);

  } catch (err) {
    logger.error("Payment initiation error", err);
    const status = err instanceof PaymentError ? 400 : 500;
    res.status(status).json({ error: err.message });
  }
});


app.post("/api/payments/webhook", express.json(), async (req, res) => {
  try {
    const signature = req.headers['x-cf-signature'];
    const result = await paymentService.handleWebhook(req.body, signature);
    
    // Broadcast payment update (unchanged)
    io.emit("payment_update", result);
    if (result.tableNo) {
      io.to(`table_${result.tableNo}`).emit("table_payment_update", result);
    }
    io.to("admin_room").emit("admin_payment_update", result);

    res.json(result);
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(400).json({
      error: "Webhook processing failed",
      details: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Chat Routes (unchanged)
app.get("/api/chat/messages", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("timestamp", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Chat messages fetch error:", err);
    res.status(500).json({ 
      error: "Failed to fetch messages",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

app.post("/api/chat", async (req, res) => {
  try {
    const { sender, message, table_number } = req.body;
    
    if (!sender || !message || !table_number) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const { data, error } = await supabase
      .from("chat_messages")
      .insert([{ 
        sender, 
        message, 
        table_number,
        timestamp: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    
    // Emit to all clients and specifically to admin
    io.emit("new_message", data[0]);
    io.to("admin_room").emit("admin_new_message", data[0]);
    
    res.status(201).json(data[0]);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ 
      error: "Failed to send message",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Socket connection handling (unchanged)
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on("join_admin", () => {
    socket.join("admin_room");
    console.log(`Admin dashboard connected: ${socket.id}`);
  });
  
  socket.on("join_table", (tableNo) => {
    socket.join(`table_${tableNo}`);
    console.log(`Socket ${socket.id} joined table ${tableNo}`);
  });

  socket.on("submit_feedback", async (feedbackData) => {
    try {
      // Store feedback in database
      const { error } = await supabase
        .from("feedback")
        .insert([{
          ...feedbackData,
          socket_id: socket.id,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      // Send confirmation to the submitting client
      socket.emit("feedback_received");

      // Notify admin dashboard
      io.to("admin_room").emit("new_feedback", {
        ...feedbackData,
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error("Feedback submission error:", err);
      socket.emit("feedback_error", { 
        message: "Failed to submit feedback"
      });
    }
  });

  socket.on("error", (error) => {
    console.error(`Socket ${socket.id} error:`, error);
  });
  
  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Global error handler (unchanged)
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack
  });

  res.status(500).json({
    status: 'error',  
    message: 'An unexpected error occurred'
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS allowed origins: ${process.env.FRONTEND_URL || "http://localhost:3000"}, http://localhost:3000/admin`);
  console.log(`WebSocket server ready`);
});