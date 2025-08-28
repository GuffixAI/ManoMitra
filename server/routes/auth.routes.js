import express from "express";
import jwt from "jsonwebtoken";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

// @desc Verify token & fetch current user info
router.get("/me", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.userDetails,
  });
});

// @desc Refresh JWT Token
router.post("/refresh", protect, async (req, res) => {
  const token = jwt.sign(
    { id: req.userDetails._id, role: req.userDetails.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );

  res.status(200).json({ success: true, token });
});


// @desc Generate a short-lived token for WebSocket authentication
router.post("/socket-token", protect, (req, res) => {
  // The `protect` middleware has already verified the user's main session
  // Now, we create a new, temporary token for the socket
  const socketToken = jwt.sign(
    { id: req.user.id, role: req.user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30s' } // Short expiry
  );
  res.status(200).json({ success: true, socketToken });
});

export default router;
