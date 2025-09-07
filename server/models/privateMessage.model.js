import mongoose from "mongoose";

const privateMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel",
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["Student", "Counsellor", "Volunteer", "Admin"],
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "readBy.userModel"
        },
        userModel: {
          type: String,
          required: true,
          enum: ["Student", "Counsellor", "Volunteer", "Admin"]
        }
      }
    ]
  },
  { timestamps: true }
);

privateMessageSchema.index({ conversation: 1, createdAt: -1 });

export default mongoose.model("PrivateMessage", privateMessageSchema);
