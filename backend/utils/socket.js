const { Server } = require("socket.io");
const logger = require("./logger");

function setupSocketIO(server, supabase) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL, process.env.ADMIN_URL]
        : "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    },
    transports: ["websocket", "polling"],
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.on("connection", (socket) => {
    logger.info(`Client connected: ${socket.id}`);

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
        const { error } = await supabase
          .from("feedback")
          .insert([
            {
              ...feedbackData,
              socket_id: socket.id,
              created_at: new Date().toISOString(),
            },
          ]);
        if (error) throw error;
        socket.emit("feedback_received");
        io.to("admin_room").emit("new_feedback", {
          ...feedbackData,
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