// FILE: server/models/room.model.js
import mongoose from "mongoose";

// The import for PEER_TOPICS is no longer needed here, so it can be removed.

const roomSchema = new mongoose.Schema(
  {
    // FIX: The `enum` validation has been removed from the 'topic' field.
    // This allows custom topics (e.g., "mindfulness") created by an admin to be saved successfully.
    // The `required`, `index`, and `unique` constraints remain, as they are still correct.
    topic: { 
      type: String, 
      required: true, 
      index: true, 
      unique: true 
    },
    
    description: { type: String, default: "" },
    moderators: [{ type: mongoose.Schema.Types.ObjectId, ref: "Volunteer" }],
  },
  { timestamps: true }
);

export default mongoose.model("Room", roomSchema);