import os

# Base directory
BASE_DIR = os.path.join(os.getcwd(), "server")

# Folder structure
FOLDERS = [
    "db",
    "models",
    "controllers",
    "routes",
    "auth",
    "middlewares",
    "constants",
]

# Files with optional boilerplate
FILES = {
    ".env": """PORT=5000
MONGO_URI=mongodb://localhost:27017/mindmitra
JWT_SECRET=yourSuperSecretKey
JWT_EXPIRE=7d
""",
    "server.js": """import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { connectDB } from "./db/connectDB.js";
import { notFound } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

// Load env vars
dotenv.config();

// Initialize app
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(cookieParser());

// Connect to DB
connectDB();

// Import Routes
import studentRoutes from "./routes/student.routes.js";
import counsellorRoutes from "./routes/counsellor.routes.js";
import volunteerRoutes from "./routes/volunteer.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import authRoutes from "./routes/auth.routes.js";

// Use Routes
app.use("/api/students", studentRoutes);
app.use("/api/counsellors", counsellorRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);

// Fallback Middlewares
app.use(notFound);
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
""",
    "db/connectDB.js": """import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    process.exit(1);
  }
};
""",
    "auth/jwt.js": """import jwt from "jsonwebtoken";

export const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
""",
    "middlewares/auth.middleware.js": """import jwt from "jsonwebtoken";
import Student from "../models/student.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";
import Admin from "../models/admin.model.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    let user;
    if (decoded.role === "student") user = await Student.findById(decoded.id);
    else if (decoded.role === "counsellor") user = await Counsellor.findById(decoded.id);
    else if (decoded.role === "volunteer") user = await Volunteer.findById(decoded.id);
    else if (decoded.role === "admin") user = await Admin.findById(decoded.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    req.userDetails = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
""",
    "middlewares/error.middleware.js": """export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
""",
    "middlewares/notFound.middleware.js": """export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.originalUrl}`,
  });
};
""",
    "constants/roles.js": """export const ROLES = {
  STUDENT: "student",
  COUNSELLOR: "counsellor",
  VOLUNTEER: "volunteer",
  ADMIN: "admin",
};
"""
}

# Empty files to create
EMPTY_FILES = [
    "models/student.model.js",
    "models/counsellor.model.js",
    "models/volunteer.model.js",
    "models/admin.model.js",
    "controllers/student.controller.js",
    "controllers/counsellor.controller.js",
    "controllers/volunteer.controller.js",
    "controllers/admin.controller.js",
    "controllers/auth.controller.js",
    "routes/student.routes.js",
    "routes/counsellor.routes.js",
    "routes/volunteer.routes.js",
    "routes/admin.routes.js",
    "routes/auth.routes.js",
]

def create_folders_and_files():
    print(f"📁 Setting up project inside: {BASE_DIR}")

    # Ensure base dir exists
    if not os.path.exists(BASE_DIR):
        print("❌ Server folder not found!")
        return

    # Create folders
    for folder in FOLDERS:
        path = os.path.join(BASE_DIR, folder)
        os.makedirs(path, exist_ok=True)

    # Create files with boilerplate
    for file, content in FILES.items():
        path = os.path.join(BASE_DIR, file)
        if not os.path.exists(path):
            with open(path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"✅ Created: {path}")
        else:
            print(f"⚡ Skipped (already exists): {path}")

    # Create empty files
    for file in EMPTY_FILES:
        path = os.path.join(BASE_DIR, file)
        if not os.path.exists(path):
            with open(path, "w", encoding="utf-8") as f:
                f.write("")
            print(f"✅ Created empty file: {path}")
        else:
            print(f"⚡ Skipped (already exists): {path}")

    print("\n🎉 Setup completed successfully!")

if __name__ == "__main__":
    create_folders_and_files()
