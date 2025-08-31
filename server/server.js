// FILE: server/server.js

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { connectDB } from "./db/connectDB.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { PEER_TOPICS } from "./constants/peer.js";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import sanitizeHtml from "sanitize-html";

// Models
import Room from "./models/room.model.js";
import Message from "./models/message.model.js";
import Student from "./models/student.model.js";
import Counsellor from "./models/counsellor.model.js";
import Volunteer from "./models/volunteer.model.js";
import Admin from "./models/admin.model.js";


dotenv.config();
const app = express();

// Security & parsing
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Enhanced CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.set('trust proxy', 1);
app.use(morgan("dev"));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cookieParser());

// Enhanced rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 600,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Static file serving
app.use("/uploads", express.static("uploads"));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development"
  });
});

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
import notificationRoutes from "./routes/notification.routes.js";

app.use("/api/students", studentRoutes);
app.use("/api/counsellors", counsellorRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/notifications", notificationRoutes);

// Fallbacks
app.use(notFound);
app.use(errorHandler);

// ---- Socket.IO Setup ----
import http from "http";
import { Server } from "socket.io";
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Hardened JWT auth middleware for WebSocket connections
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    console.error('Socket Auth Error: No token provided.');
    return next(new Error("Authentication error: Token not provided."));
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.error(`Socket Auth Error: ${err.name} - ${err.message}`);
      let errorMessage = "Authentication error";
      if (err.name === 'TokenExpiredError') {
        errorMessage = "Token expired. Please refresh.";
      } else if (err.name === 'JsonWebTokenError') {
        errorMessage = "Invalid token.";
      }
      return next(new Error(errorMessage));
    }

    if (!decoded.id || !decoded.role) {
      console.error('Socket Auth Error: Invalid token payload.');
      return next(new Error("Authentication error: Invalid token payload."));
    }

    // Fetch user details to attach to socket
    try {
      let user;
      const roleCapitalized = decoded.role.charAt(0).toUpperCase() + decoded.role.slice(1);

      switch (roleCapitalized) {
        case 'Student': user = await Student.findById(decoded.id).select('name email').lean(); break;
        case 'Counsellor': user = await Counsellor.findById(decoded.id).select('name email').lean(); break;
        case 'Volunteer': user = await Volunteer.findById(decoded.id).select('name email').lean(); break;
        case 'Admin': user = await Admin.findById(decoded.id).select('name email').lean(); break;
        default: return next(new Error("Authentication error: Unknown role."));
      }

      if (!user) {
        return next(new Error("Authentication error: User not found."));
      }
      
      socket.user = { id: decoded.id, role: decoded.role, name: user.name, email: user.email };
      next();

    } catch (dbError) {
      console.error('Socket Auth DB Error:', dbError);
      return next(new Error("Authentication error: Could not verify user."));
    }
  });
});

// Peer support namespace with enhanced features
const peer = io.of("/peer");

peer.on("connection", async (socket) => {
  console.log(`User ${socket.user.id} (${socket.user.role}) connected to peer support`);

  // Join room
  socket.on("join", async ({ topic }) => {
    try {
      if (!PEER_TOPICS.includes(topic)) {
        return socket.emit("error", { message: "Invalid topic" });
      }

      let room = await Room.findOne({ topic });
      if (!room) {
        room = await Room.create({ topic, description: `Support room for ${topic}` });
      }

      socket.join(room._id.toString());
      socket.emit("joined", { roomId: room._id, topic });

      // Notify others in room
      socket.to(room._id.toString()).emit("userJoined", {
        userId: socket.user.id,
        role: socket.user.role,
        name: socket.user.name,
      });
    } catch (error) {
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // Message send with enhanced validation
  socket.on("message", async ({ roomId, text }) => {
    try {
      if (!roomId || !text || typeof text !== 'string') {
        return socket.emit("error", { message: "Invalid message data" });
      }

      if (text.length > 2000) {
        return socket.emit("error", { message: "Message too long" });
      }
      
      // Enhanced sanitization using sanitize-html
      const cleanText = sanitizeHtml(text.slice(0, 2000), {
        allowedTags: [],
        allowedAttributes: {},
      });
      
      if (!cleanText.trim()) {
         return socket.emit("error", { message: "Message cannot be empty" });
      }

      const senderModel = socket.user.role.charAt(0).toUpperCase() + socket.user.role.slice(1);

      const msg = await Message.create({
        room: roomId,
        sender: socket.user.id,
        senderModel,
        content: cleanText
      });

      // Emit to room with enhanced data
      peer.to(roomId).emit("message", {
        id: msg._id,
        roomId,
        text: msg.content,
        sender: {
          id: socket.user.id,
          name: socket.user.name,
          role: socket.user.role,
        },
        createdAt: msg.createdAt
      });
    } catch (error) {
      console.error("Message error:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Typing indicator
  socket.on("typing", ({ roomId, typing }) => {
    if (roomId && typeof typing === 'boolean') {
      socket.to(roomId).emit("typing", {
        userId: socket.user.id,
        name: socket.user.name,
        typing: !!typing
      });
    }
  });

  // Load recent messages with pagination
  socket.on("history", async ({ roomId, limit = 50, offset = 0 }) => {
    try {
      const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
      const safeOffset = Math.max(parseInt(offset) || 0, 0);

      const msgs = await Message.find({ room: roomId })
        .sort({ createdAt: -1 })
        .skip(safeOffset)
        .limit(safeLimit)
        .populate('sender', 'name role'); // Populate sender details

      socket.emit("history", {
        messages: msgs.reverse().map(m => ({
            id: m._id,
            text: m.content,
            sender: {
                id: m.sender?._id,
                name: m.sender?.name || m.senderModel, // Use name if available
                role: m.sender?.role || m.senderModel.toLowerCase()
            },
            createdAt: m.createdAt
        })),
        hasMore: msgs.length === safeLimit,
        offset: safeOffset + safeLimit
      });
    } catch (error) {
      socket.emit("error", { message: "Failed to load message history" });
    }
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log(`User ${socket.user.id} disconnected from peer support`);
  });
});

// Error handling for socket connection attempts
io.on("connection_error", (err) => {
  console.error(`Socket Connection Error: ${err.message}`);
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 HTTP+WS running on port ${PORT}`);
  console.log(`📱 Client URL: ${process.env.CLIENT_URL || "http://localhost:3000"}`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || "development"}`);
});