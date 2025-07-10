require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const http = require("http");
const setupSocketIO = require("./utils/socket");
const helmet = require('helmet');
const { PaymentError, ERROR_CODES } = require("./utils/ErrorHandler");
const logger = require("./utils/logger");
const paymentRoutes = require('./PaymentRoutes');
const FeedbackRoutes = require('./FeedbackRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Verify Supabase connection
supabase
  .from('food_items')
  .select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection error:', error);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  });

// CORS configuration
const allowedOrigins = [
  process.env.FRONTEND_URL, // e.g. https://restaurant-management-pied.vercel.app
  process.env.ADMIN_URL,    // e.g. https://restaurant-management-pied.vercel.app/admin
  "http://localhost:3000"  // Always allow local dev
].filter(Boolean); // Remove undefined

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  methods: ['GET','POST','PUT','DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type','Authorization']
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use((req, res, next) => {
  logger.info('Incoming request', { 
    method: req.method, 
    path: req.path,
    ip: req.ip
  });
  next();
});

// Initialize Socket.IO
const io = setupSocketIO(server, supabase);

const port = process.env.PORT || 5000;

// Health Check Endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Restaurant Management System API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    websocket: io.engine && io.engine.clientsCount > 0 ? "active" : "inactive"
  });
});

// Food Items Endpoint
app.get("/api/food-items", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("food_items")
      .select("*")
      .order("category", { ascending: true });

    if (error) throw error;
    
    res.json(data);
  } catch (err) {
    logger.error("Food items error:", err);
    res.status(500).json({ 
      error: "Failed to fetch food items",
      ...(process.env.NODE_ENV === "development" && { details: err.message })
    });
  }
});

// Orders Endpoint
app.post("/api/orders", async (req, res) => {
  try {
    const { customerDetails = {}, cartItems, amount, paymentMethod } = req.body;
    const { name, email, phone, tableNo } = customerDetails;

    // Enhanced Validation
    if (!name?.trim()) throw new PaymentError("Customer name is required", ERROR_CODES.MISSING_CUSTOMER_DETAILS);
    if (!email?.trim()) throw new PaymentError("Customer email is required", ERROR_CODES.MISSING_CUSTOMER_DETAILS);
    if (!phone?.trim()) throw new PaymentError("Customer phone is required", ERROR_CODES.MISSING_CUSTOMER_DETAILS);
    if (!tableNo) throw new PaymentError("Table number is required", ERROR_CODES.MISSING_CUSTOMER_DETAILS);
    if (!Array.isArray(cartItems)) throw new PaymentError("Cart items must be an array", ERROR_CODES.INVALID_DATA);
    if (cartItems.length === 0) throw new PaymentError("Cart cannot be empty", ERROR_CODES.INVALID_DATA);
    if (!amount || isNaN(amount)) throw new PaymentError("Valid amount is required", ERROR_CODES.INVALID_AMOUNT);
    if (!paymentMethod) throw new PaymentError("Payment method is required", ERROR_CODES.INVALID_DATA);

    const order = {
      customer_name: name.trim(),
      customer_email: email.trim(),
      customer_phone: phone.trim(),
      table_number: tableNo,
      items: JSON.stringify(cartItems),
      total_price: amount,
      payment_method: paymentMethod.toLowerCase(),
      status: 'Awaiting Payment',
      created_at: new Date().toISOString(),
      order_id: `RETRO-${Date.now()}-${tableNo}`,
      payment_status: 'pending'
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([order])
      .select();

    if (error) throw error;

    const savedOrder = data[0];
    const items = JSON.parse(savedOrder.items);

    // Socket notifications
    io.emit("order_update", {
      ...savedOrder,
      event_type: "new_order",
      timestamp: new Date().toISOString(),
      items
    });
    io.to(`table_${tableNo}`).emit("table_order_update", savedOrder);
    io.to("admin_room").emit("admin_order_update", savedOrder);

    res.status(201).json({ 
      ...savedOrder, 
      items,
      message: "Order created successfully"
    });
  } catch (err) {
    logger.error("Order error:", err);
    const status = err instanceof PaymentError ? 400 : 500;
    res.status(status).json({
      error: err.message,
      ...(process.env.NODE_ENV === "development" && { 
        details: err.message,
        stack: err.stack 
      })
    });
  }
});

// Mount payment routes
app.use('/api/payments', paymentRoutes);

// Mount feedback routes
app.use('/api/feedback', FeedbackRoutes(supabase));

// Chat Endpoints
app.get("/api/chat/messages", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("timestamp", { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error("Chat messages fetch error:", err);
    res.status(500).json({ 
      error: "Failed to fetch messages",
      ...(process.env.NODE_ENV === "development" && { details: err.message })
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

    const newMessage = data[0];
    io.emit("new_message", newMessage);
    io.to("admin_room").emit("admin_new_message", newMessage);
    
    res.status(201).json(newMessage);
  } catch (err) {
    logger.error("Chat error:", err);
    res.status(500).json({ 
      error: "Failed to send message",
      ...(process.env.NODE_ENV === "development" && { details: err.message })
    });
  }
});

// Error Handling
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  res.status(500).json({
    status: 'error',
    message: 'An unexpected error occurred',
    ...(process.env.NODE_ENV === "development" && { details: err.message })
  });
});

// Server Startup
server.listen(port, '0.0.0.0', () => {
  console.log(`
  🚀 Server running on port ${port}
  ⚙️  Environment: ${process.env.NODE_ENV || "development"}
  🌐 Frontend URL: ${process.env.FRONTEND_URL}
  🔗 Backend URL: ${process.env.BACKEND_URL}
  💾 Supabase URL: ${process.env.SUPABASE_URL}
  📡 WebSocket server ready
  `);
});