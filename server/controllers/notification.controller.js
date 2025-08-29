import Notification from "../models/notification.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

// Get user notifications
export const getUserNotifications = asyncHandler(async (req, res) => {
  const {
    limit = 20,
    offset = 0,
    unreadOnly = false,
    category = null,
    includeArchived = false,
    includeExpired = false
  } = req.query;

  const notifications = await Notification.getUserNotifications(
    req.user.id,
    req.user.role,
    {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === "true",
      category,
      includeArchived: includeArchived === "true",
      includeExpired: includeExpired === "true"
    }
  );

  const total = await Notification.countDocuments({
    recipient: req.user.id,
    recipientModel: req.user.role
  });

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + notifications.length
      }
    }
  });
});

// Get unread count
export const getUnreadCount = asyncHandler(async (req, res) => {
  const { category } = req.query;
  
  const count = await Notification.getUnreadCount(
    req.user.id,
    req.user.role,
    category
  );

  res.json({
    success: true,
    data: { unreadCount: count }
  });
});

// Mark notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    recipient: req.user.id,
    recipientModel: req.user.role
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found"
    });
  }

  await notification.markAsRead();

  res.json({
    success: true,
    message: "Notification marked as read"
  });
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  const { category } = req.query;

  let query = {
    recipient: req.user.id,
    recipientModel: req.user.role,
    isRead: false
  };

  if (category) {
    query.category = category;
  }

  const result = await Notification.updateMany(query, {
    $set: {
      isRead: true,
      readAt: new Date()
    }
  });

  res.json({
    success: true,
    message: `${result.modifiedCount} notifications marked as read`
  });
});

// Archive notification
export const archiveNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    recipient: req.user.id,
    recipientModel: req.user.role
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found"
    });
  }

  await notification.archive();

  res.json({
    success: true,
    message: "Notification archived"
  });
});

// Unarchive notification
export const unarchiveNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    recipient: req.user.id,
    recipientModel: req.user.role
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found"
    });
  }

  await notification.unarchive();

  res.json({
    success: true,
    message: "Notification unarchived"
  });
});

// Delete notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findOne({
    _id: id,
    recipient: req.user.id,
    recipientModel: req.user.role
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found"
    });
  }

  await notification.deleteOne();

  res.json({
    success: true,
    message: "Notification deleted"
  });
});

// Get notification preferences (placeholder for future implementation)
export const getPreferences = asyncHandler(async (req, res) => {
  // This would typically fetch user preferences from a separate model
  const preferences = {
    email: true,
    push: true,
    sms: false,
    categories: {
      booking: true,
      chat: true,
      report: true,
      system: true,
      connection: true,
      feedback: true,
      emergency: true
    }
  };

  res.json({
    success: true,
    data: preferences
  });
});

// Update notification preferences (placeholder for future implementation)
export const updatePreferences = asyncHandler(async (req, res) => {
  const { email, push, sms, categories } = req.body;

  // This would typically update user preferences in a separate model
  // For now, just return success

  res.json({
    success: true,
    message: "Preferences updated successfully"
  });
});

// Admin: Get all notifications for a user
export const getAdminUserNotifications = asyncHandler(async (req, res) => {
  const { userId, userModel } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  const notifications = await Notification.getUserNotifications(
    userId,
    userModel,
    {
      limit: parseInt(limit),
      offset: parseInt(offset),
      includeArchived: true,
      includeExpired: true
    }
  );

  const total = await Notification.countDocuments({
    recipient: userId,
    recipientModel: userModel
  });

  res.json({
    success: true,
    data: {
      notifications,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + notifications.length
      }
    }
  });
});

// Admin: Send system notification
export const sendSystemNotification = asyncHandler(async (req, res) => {
  const { recipients, type, title, message, data, priority = "normal" } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Recipients array is required"
    });
  }

  if (!type || !title || !message) {
    return res.status(400).json({
      success: false,
      message: "Type, title, and message are required"
    });
  }

  const notifications = await Notification.createSystemNotification(
    recipients,
    type,
    title,
    message,
    data
  );

  res.json({
    success: true,
    message: `${notifications.length} notifications sent successfully`,
    data: { notifications }
  });
});

// Admin: Get notification statistics
export const getNotificationStats = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  let dateQuery = {};
  if (startDate && endDate) {
    dateQuery = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };
  }

  const [
    totalNotifications,
    unreadCount,
    readCount,
    archivedCount,
    byCategory,
    byPriority,
    byType
  ] = await Promise.all([
    Notification.countDocuments(dateQuery),
    Notification.countDocuments({ ...dateQuery, isRead: false }),
    Notification.countDocuments({ ...dateQuery, isRead: true }),
    Notification.countDocuments({ ...dateQuery, isArchived: true }),
    Notification.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Notification.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    Notification.aggregate([
      { $match: dateQuery },
      { $group: { _id: "$type", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ])
  ]);

  res.json({
    success: true,
    data: {
      totalNotifications,
      unreadCount,
      readCount,
      archivedCount,
      byCategory,
      byPriority,
      byType
    }
  });
});

// Cleanup expired notifications (admin only)
export const cleanupExpiredNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.cleanupExpired();

  res.json({
    success: true,
    message: `${result.modifiedCount} expired notifications archived`
  });
});
