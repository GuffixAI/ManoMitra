import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "recipientModel"
    },
    recipientModel: {
      type: String,
      required: true,
      enum: ["Student", "Counsellor", "Volunteer", "Admin"]
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "senderModel"
    },
    senderModel: {
      type: String,
      enum: ["Student", "Counsellor", "Volunteer", "Admin"]
    },
    type: {
      type: String,
      required: true,
      enum: [
        "booking_request",
        "booking_confirmed",
        "booking_rejected",
        "booking_cancelled",
        "booking_reminder",
        "message_received",
        "report_assigned",
        "report_resolved",
        "feedback_received",
        "connection_request",
        "connection_accepted",
        "connection_rejected",
        "room_invitation",
        "moderator_assigned",
        "system_announcement",
        "emergency_alert",
        "training_completed",
        "availability_update",
        "performance_review",
        "account_verification"
      ]
    },
    title: {
      type: String,
      required: true,
      maxlength: 100
    },
    message: {
      type: String,
      required: true,
      maxlength: 500
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal"
    },
    category: {
      type: String,
      enum: ["booking", "chat", "report", "system", "connection", "feedback", "emergency"],
      required: true
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    archivedAt: {
      type: Date
    },
    expiresAt: {
      type: Date
    },
    actionRequired: {
      type: Boolean,
      default: false
    },
    actionUrl: {
      type: String,
      maxlength: 500
    },
    actionText: {
      type: String,
      maxlength: 50
    },
    metadata: {
      ipAddress: String,
      userAgent: String,
      location: String,
      deviceType: String
    },
    deliveryStatus: {
      email: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String
      },
      push: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String
      },
      sms: {
        sent: { type: Boolean, default: false },
        sentAt: Date,
        error: String
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, isArchived: 1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, createdAt: -1 });
notificationSchema.index({ category: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 });
notificationSchema.index({ "deliveryStatus.email.sent": 1 });
notificationSchema.index({ "deliveryStatus.push.sent": 1 });

// Virtual properties
notificationSchema.virtual("timeSinceCreated").get(function() {
  return Date.now() - this.createdAt.getTime();
});

notificationSchema.virtual("isExpired").get(function() {
  if (!this.expiresAt) return false;
  return Date.now() > this.expiresAt.getTime();
});

notificationSchema.virtual("age").get(function() {
  const now = new Date();
  const created = this.createdAt;
  const diffMs = now - created;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return "Just now";
});

// Pre-save middleware
notificationSchema.pre("save", function(next) {
  // Set default category based on type
  if (!this.category) {
    const typeToCategory = {
      booking_request: "booking",
      booking_confirmed: "booking",
      booking_rejected: "booking",
      booking_cancelled: "booking",
      booking_reminder: "booking",
      message_received: "chat",
      report_assigned: "report",
      report_resolved: "report",
      feedback_received: "feedback",
      connection_request: "connection",
      connection_accepted: "connection",
      connection_rejected: "connection",
      room_invitation: "chat",
      moderator_assigned: "chat",
      system_announcement: "system",
      emergency_alert: "emergency",
      training_completed: "system",
      availability_update: "system",
      performance_review: "system",
      account_verification: "system"
    };
    this.category = typeToCategory[this.type] || "system";
  }
  
  // Set priority based on type
  if (this.type === "emergency_alert") {
    this.priority = "urgent";
  } else if (this.type === "booking_request" || this.type === "connection_request") {
    this.priority = "high";
  }
  
  // Set default expiration for certain types
  if (!this.expiresAt) {
    const now = new Date();
    switch (this.type) {
      case "booking_reminder":
        this.expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
        break;
      case "connection_request":
        this.expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
        break;
      case "room_invitation":
        this.expiresAt = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
        break;
    }
  }
  
  next();
});

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsUnread = function() {
  this.isRead = false;
  this.readAt = undefined;
  return this.save();
};

notificationSchema.methods.archive = function() {
  this.isArchived = true;
  this.archivedAt = new Date();
  return this.save();
};

notificationSchema.methods.unarchive = function() {
  this.isArchived = false;
  this.archivedAt = undefined;
  return this.save();
};

notificationSchema.methods.updateDeliveryStatus = function(channel, status, error = null) {
  if (this.deliveryStatus[channel]) {
    this.deliveryStatus[channel].sent = status;
    this.deliveryStatus[channel].sentAt = status ? new Date() : undefined;
    this.deliveryStatus[channel].error = error;
  }
  return this.save();
};

// Static methods
notificationSchema.statics.getUserNotifications = function(userId, userModel, options = {}) {
  const {
    limit = 20,
    offset = 0,
    unreadOnly = false,
    category = null,
    includeArchived = false,
    includeExpired = false
  } = options;
  
  let query = { recipient: userId, recipientModel: userModel };
  
  if (unreadOnly) {
    query.isRead = false;
  }
  
  if (category) {
    query.category = category;
  }
  
  if (!includeArchived) {
    query.isArchived = false;
  }
  
  if (!includeExpired) {
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ];
  }
  
  return this.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .populate("sender", "name profileImage")
    .lean();
};

notificationSchema.statics.getUnreadCount = function(userId, userModel, category = null) {
  let query = {
    recipient: userId,
    recipientModel: userModel,
    isRead: false,
    isArchived: false
  };
  
  if (category) {
    query.category = category;
  }
  
  // Exclude expired notifications
  query.$or = [
    { expiresAt: { $exists: false } },
    { expiresAt: { $gt: new Date() } }
  ];
  
  return this.countDocuments(query);
};

notificationSchema.statics.markAllAsRead = function(userId, userModel) {
  return this.updateMany(
    {
      recipient: userId,
      recipientModel: userModel,
      isRead: false
    },
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    }
  );
};

notificationSchema.statics.cleanupExpired = function() {
  return this.updateMany(
    {
      expiresAt: { $lt: new Date() }
    },
    {
      $set: {
        isArchived: true,
        archivedAt: new Date()
      }
    }
  );
};

notificationSchema.statics.createSystemNotification = function(recipients, type, title, message, data = {}) {
  const notifications = recipients.map(recipient => ({
    recipient: recipient.userId,
    recipientModel: recipient.userModel,
    type,
    title,
    message,
    data,
    category: "system",
    priority: "normal"
  }));
  
  return this.insertMany(notifications);
};

export default mongoose.model("Notification", notificationSchema);
