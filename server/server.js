import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
// import xss from "xss-clean";
import { connectDB } from "./db/connectDB.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { PEER_TOPICS } from "./constants/peer.js";
import jwt from "jsonwebtoken";


// Models for WS
import Room from "./models/room.model.js";
import Message from "./models/message.model.js";

dotenv.config();
const app = express();

// Security & parsing
app.use(express.json({ limit:"1mb" }));
// app.use(cors({ origin: "*"}));
app.set('trust proxy', 1);
app.use(cors({
  origin: process.env.CLIENT_URL ?? "http://localhost:3000",
  credentials: true
}));
app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());
// app.use(xss());
app.use("/uploads", express.static("uploads")); 

// Rate limit (basic)
app.use("/api/", rateLimit({ windowMs: 15*60*1000, max: 600 }));

// DB
connectDB();

// Routes
import studentRoutes from "./routes/student.routes.js";
import counsellorRoutes from "./routes/counsellor.routes.js";
import volunteerRoutes from "./routes/volunteer.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import reportRoutes from "./routes/report.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import roomRoutes from "./routes/room.routes.js";

app.use("/api/students", studentRoutes);
app.use("/api/counsellors", counsellorRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/rooms", roomRoutes);

// Fallbacks
app.use(notFound);
app.use(errorHandler);

// ---- Socket.IO Setup ----
import http from "http";
import { Server } from "socket.io";
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// JWT auth on WS
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
    if (!token) return next(new Error("Unauthorized"));
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = { id: payload.id, role: payload.role };
    next();
  } catch (e) { next(new Error("Unauthorized")); }
});

// Peer support namespace
const peer = io.of("/peer");

peer.on("connection", async (socket) => {
  // Join room
  socket.on("join", async ({ topic }) => {
    if (!PEER_TOPICS.includes(topic)) return socket.emit("error", "Invalid topic");
    let room = await Room.findOne({ topic });
    if (!room) room = await Room.create({ topic });
    socket.join(room._id.toString());
    socket.emit("joined", { roomId: room._id, topic });
  });

  // Message send
  socket.on("message", async ({ roomId, text }) => {
    try {
      if (!roomId || !text) return;
      // basic sanitize on server
      const clean = String(text).slice(0, 2000).replace(/<[^>]*>?/gm, "");
      const senderModel = socket.user.role === "volunteer" ? "Volunteer" : "Student";
      const msg = await Message.create({ room: roomId, sender: socket.user.id, senderModel, text: clean });
      peer.to(roomId).emit("message", {
        id: msg._id, roomId, text: msg.text, senderModel, createdAt: msg.createdAt
      });
    } catch (e) {
      socket.emit("error", "Failed to send message");
    }
  });

  // Typing indicator
  socket.on("typing", ({ roomId, typing }) => {
    socket.to(roomId).emit("typing", { userId: socket.user.id, typing: !!typing });
  });

  // Load recent messages
  socket.on("history", async ({ roomId, limit = 50 }) => {
    const msgs = await Message.find({ room: roomId }).sort({ createdAt: -1 }).limit(Math.min(limit, 100));
    socket.emit("history", msgs.reverse());
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 HTTP+WS running on :${PORT}`));
