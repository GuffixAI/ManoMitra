import Conversation from "../models/conversation.model.js";
import PrivateMessage from "../models/privateMessage.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

// @desc    Get all conversations for the logged-in user
// @route   GET /api/conversations
export const getMyConversations = asyncHandler(async (req, res) => {
  const conversations = await Conversation.find({ "participants.user": req.user.id })
    .populate({
      path: "participants.user",
      select: "name email role profileImage",
    })
    .populate({
        path: "lastMessage",
        select: "content createdAt"
    })
    .sort({ updatedAt: -1 });

  res.status(200).json({ success: true, data: conversations });
});

// @desc    Get messages for a conversation with a specific user
// @route   GET /api/conversations/with/:userId
export const getMessagesWithUser = asyncHandler(async (req, res) => {
    const { userId: otherUserId } = req.params;
    const myUserId = req.user.id;

    let conversation = await Conversation.findOne({
        "participants.user": { $all: [myUserId, otherUserId] }
    });

    if (!conversation) {
        // Or you can choose to return an empty array if no conversation has started yet
        return res.status(200).json({ success: true, data: [] });
    }

    const messages = await PrivateMessage.find({ conversation: conversation._id })
        .populate("sender", "name email role profileImage")
        .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: messages });
});