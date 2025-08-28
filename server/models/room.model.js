// room.model.js
import mongoose from "mongoose";
import { PEER_TOPICS } from "../constants/peer.js";

const roomSchema = new mongoose.Schema(
  {
    topic: { type: String, enum: PEER_TOPICS, required: true, index: true, unique: true },
    description: { type: String, default: "" },
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" }],
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);
