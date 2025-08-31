import express from "express";
import jwt from "jsonwebtoken";
import { protect } from "../middlewares/auth.middleware.js";
import { 
  loginStudent, 
  registerStudent,
  loginCounsellor,
  registerCounsellor,
  loginVolunteer,
  registerVolunteer,
  loginAdmin,
  universalLogin,
  changePassword
} from "../controllers/auth.controller.js";

const router = express.Router();

// Universal login endpoint
router.post("/login", universalLogin);

// Role-specific login endpoints
router.post("/student/login", loginStudent);
router.post("/counsellor/login", loginCounsellor);
router.post("/volunteer/login", loginVolunteer);
router.post("/admin/login", loginAdmin);

// Registration endpoints
router.post("/student/register", registerStudent);
router.post("/counsellor/register", registerCounsellor);
router.post("/volunteer/register", registerVolunteer);

// @desc Change password for authenticated user
router.post("/change-password", protect, changePassword);

// @desc Verify token & fetch current user info
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.userDetails, // Use req.userDetails which is the full user object
  });
});

// @desc Refresh JWT Token
router.post("/refresh", protect, async (req, res) => {
  try {
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    res.status(200).json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to refresh token" });
  }
});

// @desc Generate a short-lived token for WebSocket authentication
router.post("/socket-token", protect, (req, res) => {
  try {
    // The `protect` middleware has already verified the user's main session
    // Now, we create a new, temporary token for the socket
    const socketToken = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30s' } // Short expiry
    );
    res.status(200).json({ success: true, socketToken });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to generate socket token" });
  }
});

// @desc Logout (client-side token removal)
router.post("/logout", protect, (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: "Logout successful. Please remove the token from client storage." 
  });
});

export default router;