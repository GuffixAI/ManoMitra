import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getMyConversations, getMessagesWithUser } from "../controllers/conversation.controller.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get("/", getMyConversations);
router.get("/with/:userId", getMessagesWithUser);

export default router;