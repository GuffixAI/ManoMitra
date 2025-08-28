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

export default router;
