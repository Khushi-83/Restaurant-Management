require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.get("/", (req, res) => {
    res.send("Welcome to the Restaurant Management System API!");
});
  

/**
 * @route GET /api/food-items
 * @desc Get all food items
 */
app.get("/api/food-items", async (req, res) => {
  try {
    let { data, error } = await supabase.from("food_items").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/food-items
 * @desc Add a new food item
 */
app.post("/api/food-items", async (req, res) => {
  try {
    const { name, price, quantity, image_url, category } = req.body;
    let { data, error } = await supabase.from("food_items").insert([{ name, price, quantity, image_url, category }]);
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/orders
 * @desc Place an order
 */
app.post("/api/orders", async (req, res) => {
  try {
    const { customer_name, table_number, items, total_price, payment_method } = req.body;
    let { data, error } = await supabase.from("orders").insert([{ customer_name, table_number, items, total_price, payment_method, status: "Pending" }]);
    if (error) throw error;
    io.emit("order_update", data);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route GET /api/orders
 * @desc Get all orders for admin
 */
app.get("/api/orders", async (req, res) => {
  try {
    let { data, error } = await supabase.from("orders").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/chat
 * @desc Send chat messages
 */
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

/**
 * @route GET /api/chat
 * @desc Get chat messages
 */
app.get("/api/chat", async (req, res) => {
  try {
    let { data, error } = await supabase.from("chat_messages").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WebSockets for real-time updates
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(port, () => console.log(`Server running on port ${port}`));
