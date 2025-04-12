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

// Enhanced Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? [process.env.FRONTEND_URL]
      : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000
});

const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === "production" 
    ? [process.env.FRONTEND_URL, "http://localhost:3000/admin"]
    : ["http://localhost:3000", "http://localhost:3001"],
  credentials: true
}));
app.use(express.json());

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
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([{ 
        customer_name, 
        table_number, 
        items: JSON.stringify(items),
        total_price,
        payment_method,
        status: payment_method === "cash" ? "Pending" : "Awaiting Payment",
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    
    // Emit to all connected clients
    io.emit("order_update", {
      ...data[0],
      event_type: "new_order",
      timestamp: new Date().toISOString()
    });
    
    // Emit specifically to admin dashboard
    io.to("admin_room").emit("admin_order_update", data[0]);
    
    res.status(201).json(data[0]);
    
  } catch (err) {
    console.error("Order error:", err);
    res.status(500).json({ 
      error: "Failed to create order",
      details: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

// Get all orders
app.get("/api/orders", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("Orders fetch error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Payment Routes
app.post("/api/payments/initiate", async (req, res) => {
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
    if (!cashfree.pgVerifyWebhook(req.body)) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const { order_id, order_status, cf_payment_id, payment_method } = req.body;
    
    // Update order status in database
    const { data, error } = await supabase
      .from("orders")
      .update({ 
        status: order_status === "PAID" ? "Paid" : "Failed",
        payment_id: cf_payment_id,
        payment_method,
        updated_at: new Date().toISOString()
      })
      .eq("order_id", order_id)
      .select();

    if (error) throw error;

    // Emit payment update to all relevant clients
    const paymentData = {
      order_id,
      status: order_status,
      amount: req.body.order_amount,
      tableNo: order_id.split('-')[2], // Extract table number from order_id
      timestamp: new Date().toISOString()
    };

    io.emit("payment_update", paymentData);
    
    // Specific emission to admin dashboard
    io.to("admin_room").emit("admin_payment_update", paymentData);
    
    res.json({ success: true });
    
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

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ 
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`CORS allowed origins: ${process.env.FRONTEND_URL || "http://localhost:3000"}, http://localhost:3000/admin`);
  console.log(`WebSocket server ready`);
});