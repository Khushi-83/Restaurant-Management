const { Server } = require("socket.io");
const logger = require("./logger");

function setupSocketIO(server, supabase) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL, process.env.ADMIN_URL]
        : ["http://localhost:3000"],
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
    path: '/socket.io',
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Room joins for targeted updates
    socket.on("join_admin", () => {
      try {
        socket.join("admin_room");
        logger.info(`Socket ${socket.id} joined admin_room`);
      } catch (err) {
        logger.error("Failed to join admin_room", err);
      }
    });

    socket.on("join_table", (tableNumber) => {
      try {
        if (!tableNumber) return;
        const room = `table_${tableNumber}`;
        socket.join(room);
        logger.info(`Socket ${socket.id} joined ${room}`);
      } catch (err) {
        logger.error("Failed to join table room", err);
      }
    });

    socket.on("new_message", async (msg) => {
      try {
        const { sender, message } = msg;
        if (!sender || !message) return;
        // Save to DB (only sender, message, timestamp)
        const { data, error } = await supabase
          .from("chat_messages")
          .insert([
            {
              sender,
              message,
              timestamp: new Date().toISOString(),
            },
          ])
          .select();
        if (error) throw error;
        const newMessage = data[0];
        io.emit("new_message", newMessage);
      } catch (err) {
        logger.error("Chat error:", err);
      }
    });

    socket.on("submit_feedback", async (feedbackData) => {
      try {
        // Remove submitted_at field but keep date
        const { submitted_at, ...cleanFeedbackData } = feedbackData;
        
        const { error } = await supabase
          .from("feedback")
          .insert([
            {
              ...cleanFeedbackData,
              socket_id: socket.id,
              created_at: new Date().toISOString(),
            },
          ]);
        if (error) throw error;
        socket.emit("feedback_received");
        io.to("admin_room").emit("new_feedback", {
          ...cleanFeedbackData,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        logger.error("Feedback submission error:", err);
        socket.emit("feedback_error", { message: "Failed to submit feedback" });
      }
    });

    socket.on("disconnect", (reason) => {
      logger.info(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });
  });

  return io;
}

module.exports = setupSocketIO; 