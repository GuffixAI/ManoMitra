// message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderModel"
    },
    senderModel: {
      type: String,
      required: true,
      enum: ["Student", "Counsellor", "Volunteer", "Admin"]
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system", "announcement"],
      default: "text"
    },
    attachments: [{
      filename: {
        type: String,
        required: true,
        maxlength: 255
      },
      originalName: {
        type: String,
        required: true,
        maxlength: 255
      },
      mimeType: {
        type: String,
        required: true
      },
      size: {
        type: Number,
        required: true,
        min: 0
      },
      url: {
        type: String,
        required: true
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "deletedByModel"
    },
    deletedByModel: {
      type: String,
      enum: ["Student", "Counsellor", "Volunteer", "Admin"]
    },
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "reactions.userModel"
      },
      userModel: {
        type: String,
        required: true,
        enum: ["Student", "Counsellor", "Volunteer", "Admin"]
      },
      emoji: {
        type: String,
        required: true,
        maxlength: 10
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    mentions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "mentions.userModel"
      },
      userModel: {
        type: String,
        required: true,
        enum: ["Student", "Counsellor", "Volunteer", "Admin"]
      }
    }],
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },
    isPinned: {
      type: Boolean,
      default: false
    },
    pinnedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "pinnedByModel"
    },
    pinnedByModel: {
      type: String,
      enum: ["Student", "Counsellor", "Volunteer", "Admin"]
    },
    pinnedAt: {
      type: Date
    },
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "readBy.userModel"
      },
      userModel: {
        type: String,
        required: true,
        enum: ["Student", "Counsellor", "Volunteer", "Admin"]
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    metadata: {
      ipAddress: String,
      userAgent: String,
      location: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ "reactions.user": 1 });
messageSchema.index({ "mentions.user": 1 });
messageSchema.index({ "readBy.user": 1 });
messageSchema.index({ isDeleted: 1 });
messageSchema.index({ messageType: 1 });

// Virtual properties
messageSchema.virtual("timeSinceSent").get(function() {
  return Date.now() - this.createdAt.getTime();
});

messageSchema.virtual("reactionCounts").get(function() {
  const counts = {};
  this.reactions.forEach(reaction => {
    counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
  });
  return counts;
});

messageSchema.virtual("readCount").get(function() {
  return this.readBy.length;
});

// Pre-save middleware
messageSchema.pre("save", function(next) {
  // Update editedAt when content changes
  if (this.isModified("content") && this.isEdited) {
    this.editedAt = new Date();
  }
  
  // Update deletedAt when deleted
  if (this.isModified("isDeleted") && this.isDeleted) {
    this.deletedAt = new Date();
  }
  
  next();
});

// Instance methods
messageSchema.methods.addReaction = function(userId, userModel, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    r => !(r.user.toString() === userId.toString() && r.userModel === userModel)
  );
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    userModel,
    emoji,
    createdAt: new Date()
  });
  
  return this.save();
};

messageSchema.methods.removeReaction = function(userId, userModel, emoji) {
  this.reactions = this.reactions.filter(
    r => !(r.user.toString() === userId.toString() && r.userModel === userModel && r.emoji === emoji)
  );
  
  return this.save();
};

messageSchema.methods.markAsRead = function(userId, userModel) {
  // Remove existing read entry
  this.readBy = this.readBy.filter(
    r => !(r.user.toString() === userId.toString() && r.userModel === userModel)
  );
  
  // Add new read entry
  this.readBy.push({
    user: userId,
    userModel,
    readAt: new Date()
  });
  
  return this.save();
};

messageSchema.methods.softDelete = function(userId, userModel) {
  this.isDeleted = true;
  this.deletedBy = userId;
  this.deletedByModel = userModel;
  this.deletedAt = new Date();
  
  return this.save();
};

messageSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedBy = undefined;
  this.deletedByModel = undefined;
  this.deletedAt = undefined;
  
  return this.save();
};

messageSchema.methods.pin = function(userId, userModel) {
  this.isPinned = true;
  this.pinnedBy = userId;
  this.pinnedByModel = userModel;
  this.pinnedAt = new Date();
  
  return this.save();
};

messageSchema.methods.unpin = function() {
  this.isPinned = false;
  this.pinnedBy = undefined;
  this.pinnedByModel = undefined;
  this.pinnedAt = undefined;
  
  return this.save();
};

// Static methods
messageSchema.statics.getRoomMessages = function(roomId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    before = null,
    after = null,
    messageType = null,
    includeDeleted = false
  } = options;
  
  let query = { room: roomId };
  
  if (!includeDeleted) {
    query.isDeleted = false;
  }
  
  if (messageType) {
    query.messageType = messageType;
  }
  
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  
  if (after) {
    query.createdAt = { $gt: new Date(after) };
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("sender", "name profileImage")
    .populate("replyTo", "content sender")
    .populate("attachments")
    .lean();
};

messageSchema.statics.getPinnedMessages = function(roomId) {
  return this.find({
    room: roomId,
    isPinned: true,
    isDeleted: false
  })
    .sort({ pinnedAt: -1 })
    .populate("sender", "name profileImage")
    .populate("pinnedBy", "name")
    .lean();
};

messageSchema.statics.searchMessages = function(roomId, searchTerm, options = {}) {
  const {
    limit = 20,
    offset = 0,
    messageType = null,
    includeDeleted = false
  } = options;
  
  let query = {
    room: roomId,
    content: { $regex: searchTerm, $options: "i" }
  };
  
  if (!includeDeleted) {
    query.isDeleted = false;
  }
  
  if (messageType) {
    query.messageType = messageType;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("sender", "name profileImage")
    .lean();
};

messageSchema.statics.getUnreadCount = function(roomId, userId, userModel, lastReadAt) {
  const query = {
    room: roomId,
    isDeleted: false,
    createdAt: { $gt: lastReadAt }
  };
  
  // Exclude messages from the user themselves
  if (userModel) {
    query.$or = [
      { sender: { $ne: userId } },
      { senderModel: { $ne: userModel } }
    ];
  }
  
  return this.countDocuments(query);
};

export default mongoose.model("Message", messageSchema);
