import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "participants.userModel",
        },
        userModel: {
          type: String,
          required: true,
          enum: ["Student", "Counsellor", "Volunteer"],
        },
      },
    ],
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PrivateMessage",
    },
  },
  { timestamps: true }
);

// Ensure a conversation between two specific users is unique
conversationSchema.index({ "participants.user": 1 }, { unique: false });

export default mongoose.model("Conversation", conversationSchema);