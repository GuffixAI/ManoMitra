// message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    room:   { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, refPath: "senderModel", required: true },
    senderModel: { type: String, enum: ["Student","Volunteer"], required: true },
    text:   { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
