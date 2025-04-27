require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const { Cashfree } = require("cashfree-pg");
const http = require("http");
const { Server } = require("socket.io");
const paymentRoutes = require('./PaymentRoutes');
const helmet = require('helmet');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);

// Enhanced Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? process.env.FRONTEND_URL.split(',')
      : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

const port = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Enhanced Security Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? process.env.FRONTEND_URL
    : "http://localhost:3000",
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip
  });``
  next();
});

app.use('/api/payments', paymentRoutes);

// Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Cashfree Payment Gateway
const cashfree = new Cashfree({
  env: process.env.CASHFREE_ENV || "TEST",
  clientId: process.env.CASHFREE_APP_ID,
  clientSecret: process.env.CASHFREE_SECRET_KEY,
});

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({ 
    status: "healthy",
    message: "Restaurant Management System API",
    websocket: io.engine.clientsCount > 0 ? "active" : "inactive"
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

// Order Routes - Enhanced with proper error handling and real-time updates
app.post("/api/orders", async (req, res) => {
  try {
    const { customer_name, table_number, items, total_price, payment_method } = req.body;
    
    // Enhanced validation
    if (!customer_name?.trim()) {
      return res.status(400).json({ error: "Customer name is required" });
    }
    
    if (!table_number || isNaN(table_number)) {
      return res.status(400).json({ error: "Valid table number is required" });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    if (!total_price || isNaN(total_price) || total_price <= 0) {
      return res.status(400).json({ error: "Valid total price is required" });
    }

    if (!["cash", "online"].includes(payment_method?.toLowerCase())) {
      return res.status(400).json({ error: "Valid payment method (cash/online) is required" });
    }

    // Validate each item in the order
    for (const item of items) {
      if (!item.id || !item.name || !item.quantity || !item.price) {
        return res.status(400).json({ 
          error: "Each item must have id, name, quantity, and price" 
        });
      }
    }

    const order = {
      customer_name: customer_name.trim(),
      table_number,
      items: JSON.stringify(items),
      total_price,
      payment_method: payment_method.toLowerCase(),
      status: payment_method.toLowerCase() === "cash" ? "Pending" : "Awaiting Payment",
      created_at: new Date().toISOString(),
      order_id: `ORDER-${Date.now()}-${table_number}`
    };

    const { data, error } = await supabase
      .from("orders")
      .insert([order])
      .select();

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create order in database");
    }
    
    const orderData = data[0];
    
    // Emit to all connected clients with enhanced data
    io.emit("order_update", {
      ...orderData,
      event_type: "new_order",
      timestamp: new Date().toISOString(),
      items: JSON.parse(orderData.items) // Parse items for socket emission
    });
    
    // Emit to specific table
    io.to(`table_${table_number}`).emit("table_order_update", {
      ...orderData,
      items: JSON.parse(orderData.items)
    });
    
    // Emit to admin dashboard
    io.to("admin_room").emit("admin_order_update", {
      ...orderData,
      items: JSON.parse(orderData.items)
    });
    
    res.status(201).json({
      ...orderData,
      items: JSON.parse(orderData.items)
    });
    
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ 
      error: "Failed to create order",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Get all orders - Enhanced with pagination and filtering
app.get("/api/orders", async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      table_number,
      start_date,
      end_date 
    } = req.query;

    let query = supabase
      .from("orders")
      .select("*", { count: "exact" });

    // Apply filters if provided
    if (status) {
      query = query.eq("status", status);
    }
    
    if (table_number) {
      query = query.eq("table_number", table_number);
    }

    if (start_date) {
      query = query.gte("created_at", start_date);
    }

    if (end_date) {
      query = query.lte("created_at", end_date);
    }

    // Add pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    // Parse items JSON for each order
    const ordersWithParsedItems = data.map(order => ({
      ...order,
      items: JSON.parse(order.items)
    }));

    res.json({
      orders: ordersWithParsedItems,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_orders: count,
        per_page: parseInt(limit)
      }
    });

  } catch (err) {
    console.error("Orders fetch error:", err);
    res.status(500).json({ 
      error: "Failed to fetch orders",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Payment Routes
app.post("/api/payments/create-session", async (req, res) => {
  try {
    const { orderId, amount, tableNo, customerName } = req.body;

    const order = {
      order_id: `RESTRO-${Date.now()}-${tableNo}`,
      order_amount: amount,
      order_currency: "INR",
      order_note: `Table ${tableNo} - ${customerName || "Guest"}`,
      customer_details: {
        customer_id: `table-${tableNo}`,
        customer_name: customerName || `Table ${tableNo} Customer`,
      }
    };

    const { payment_session_id } = await cashfree.pgOrderCreate(order);
    res.json({ 
      paymentSessionId: payment_session_id,
      orderId: order.order_id
    });
    
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ 
      error: "Payment initiation failed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Webhook Route - Enhanced with proper validation and real-time updates
app.post("/api/payments/webhook", express.json(), async (req, res) => {
  try {
    // Validate webhook signature
    if (!req.body || !req.headers['x-webhook-signature']) {
      return res.status(400).json({ error: "Missing webhook data or signature" });
    }

    if (!cashfree.pgVerifyWebhook(req.body)) {
      console.error("Invalid webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { 
      order_id, 
      order_status, 
      cf_payment_id, 
      payment_method,
      order_amount,
      payment_time,
      payment_currency,
      payment_message
    } = req.body;

    // Validate required fields
    if (!order_id || !order_status || !cf_payment_id) {
      return res.status(400).json({ error: "Missing required payment information" });
    }

    // Map Cashfree status to our system status
    const orderStatus = {
      'PAID': 'Paid',
      'FAILED': 'Failed',
      'CANCELLED': 'Cancelled',
      'PENDING': 'Pending'
    }[order_status] || 'Unknown';

    // Update order status in database with retry mechanism
    let retries = 3;
    let updateError;

    while (retries > 0) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .update({ 
            status: orderStatus,
            payment_id: cf_payment_id,
            payment_method,
            payment_time: payment_time || new Date().toISOString(),
            payment_currency,
            payment_message,
            updated_at: new Date().toISOString()
          })
          .eq("order_id", order_id)
          .select();

        if (error) throw error;

        // Extract table number from order_id (FORMAT: ORDER-timestamp-tableNo)
        const tableNo = order_id.split('-')[2];

        // Prepare payment update data
        const paymentData = {
          order_id,
          status: orderStatus,
          amount: order_amount,
          payment_id: cf_payment_id,
          payment_method,
          payment_time: payment_time || new Date().toISOString(),
          payment_message,
          table_number: tableNo,
          timestamp: new Date().toISOString()
        };

        // Emit to all relevant clients
        io.emit("payment_update", paymentData);
        
        // Emit to specific table
        if (tableNo) {
          io.to(`table_${tableNo}`).emit("table_payment_update", paymentData);
        }
        
        // Emit to admin dashboard
        io.to("admin_room").emit("admin_payment_update", paymentData);
        
        // Log successful payment
        console.log(`Payment processed successfully: ${order_id}, Status: ${orderStatus}`);
        
        return res.json({ 
          success: true,
          message: `Payment ${orderStatus.toLowerCase()} for order ${order_id}`,
          data: paymentData
        });

      } catch (err) {
        updateError = err;
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }

    // If all retries failed
    throw updateError;
    
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ 
      error: "Webhook processing failed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Chat Routes - Enhanced with proper validation
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

// Socket connection handling
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Admin dashboard connection
  socket.on("join_admin", () => {
    socket.join("admin_room");
    console.log(`Admin dashboard connected: ${socket.id}`);
  });
  
  // Table-specific connection
  socket.on("join_table", (tableNo) => {
    socket.join(`table_${tableNo}`);
    console.log(`Socket ${socket.id} joined table ${tableNo}`);
  });

  // Handle feedback submission
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

  // Error handling
  socket.on("error", (error) => {
    console.error(`Socket ${socket.id} error:`, error);
  });
  
  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
  });
});

// Global error handler
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

// Add new route to match frontend expectations
app.post('/api/payments/initiate', async (req, res) => {
  try {
    const { amount, customerDetails, cartItems } = req.body;
    const { customerName, customerEmail, customerPhone } = customerDetails;

    // Extract table number from cartItems or another source
    const tableNo = cartItems[0]?.tableNo || 'defaultTableNo'; // Adjust as needed

    const order = {
      order_id: `RESTRO-${Date.now()}-${tableNo}`,
      order_amount: amount,
      order_currency: "INR",
      order_note: `Table ${tableNo} - ${customerName || "Guest"}`,
      customer_details: {
        customer_id: `table-${tableNo}`,
        customer_name: customerName || `Table ${tableNo} Customer`,
        customer_email: customerEmail,
        customer_phone: customerPhone
      }
    };

    const { payment_session_id } = await cashfree.pgOrderCreate(order);
    res.json({ 
      paymentSessionId: payment_session_id,
      orderId: order.order_id
    });
  } catch (err) {
    console.error("Payment initiation error:", err);
    res.status(500).json({ 
      error: "Payment initiation failed",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS allowed origins: ${process.env.FRONTEND_URL || "http://localhost:3000"}, http://localhost:3000/admin`);
  console.log(`WebSocket server ready`);
});