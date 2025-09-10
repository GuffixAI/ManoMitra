// FILE: server/controllers/admin.controller.js
import Admin from "../models/admin.model.js";
import Student from "../models/student.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";
import Report from "../models/report.model.js";
import Booking from "../models/booking.model.js";
import { ROLES } from "../constants/roles.js";
import Notification from "../models/notification.model.js";


import AnalyticsSnapshot from "../models/analyticSnapshot.model.js";
import axios from "axios";
const ANALYTIC_SERVER_URL = process.env.ANALYTIC_SERVER_URL || 'http://localhost:8001';




// ADDED: Get admin profile controller
export const getProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin profile not found" });
    }
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ADDED: Update admin profile controller
export const updateProfile = async (req, res) => {
  try {
    const { name, contactNumber } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (contactNumber) updateData.contactNumber = contactNumber;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedAdmin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// **REMOVED for security.** The creation of a super admin should be a
// one-time script run on the server, not a public API endpoint.
/*
export const createSuperAdmin = async (req, res) => { ... };
*/

// Get admin dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      totalCounsellors,
      totalVolunteers,
      totalReports,
      totalBookings,
      pendingReports,
      urgentReports,
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Counsellor.countDocuments({ isActive: true }),
      Volunteer.countDocuments({ isActive: true }),
      Report.countDocuments(),
      Booking.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({
        priority: "urgent",
        status: { $in: ["pending", "in_progress"] },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          students: totalStudents,
          counsellors: totalCounsellors,
          volunteers: totalVolunteers,
        },
        reports: {
          total: totalReports,
          pending: pendingReports,
          urgent: urgentReports,
        },
        bookings: totalBookings,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all students with pagination and filters
export const getAllStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      department,
      academicYear,
      status,
    } = req.query;

    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: "i" };
    if (department) query.department = department;
    if (academicYear) query.academicYear = parseInt(academicYear);
    if (status) query.isActive = status === "active";

    const students = await Student.find(query)
      .select("-password")
      .populate("counsellorConnected", "name email specialization")
      .populate("volunteerConnected", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Student.countDocuments(query);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all counsellors with pagination and filters
export const getAllCounsellors = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, specialization, status } = req.query;

    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: "i" };
    if (specialization)
      query.specialization = { $regex: specialization, $options: "i" };
    if (status) query.isActive = status === "active";

    const counsellors = await Counsellor.find(query)
      .select("-password")
      .populate("students", "name email studentCode")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Counsellor.countDocuments(query);

    res.status(200).json({
      success: true,
      data: counsellors,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all volunteers with pagination and filters
export const getAllVolunteers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, availability, status } = req.query;

    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: "i" };
    if (availability) query.availability = availability;
    if (status) query.isActive = status === "active";

    const volunteers = await Volunteer.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Volunteer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: volunteers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reports with pagination and filters
export const getAllReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, category } = req.query;

    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (category) query.category = category;

    const reports = await Report.find(query)
      .populate("owner", "name email studentCode")
      .populate("assignedTo", "name email specialization")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign report to counsellor
export const assignReport = async (req, res) => {
  try {
    const { reportId, counsellorId } = req.body;

    if (!reportId || !counsellorId) {
      return res.status(400).json({
        success: false,
        message: "Report ID and counsellor ID are required",
      });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found" });
    }

    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor || !counsellor.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Counsellor not found or inactive" });
    }

    await report.assignToCounsellor(counsellorId);

    await Notification.create({
      recipient: counsellorId,
      recipientModel: "Counsellor",
      sender: req.user.id,
      senderModel: "Admin",
      type: "report_assigned",
      category: "report",
      title: "New Report Assigned",
      message: `A report titled "${report.title}" has been assigned to you for review.`,
      data: { reportId: report._id },
      actionUrl: `/counsellor/reports/${report._id}`,
    });

    res.status(200).json({
      success: true,
      message: "Report assigned successfully",
      data: report,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId, userType, isActive } = req.body;

    if (!userId || !userType || typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "User ID, user type, and status are required",
      });
    }

    let user;
    // **FIX: Added .select('-password') to prevent leaking password hash**
    switch (userType) {
      case "student":
        user = await Student.findByIdAndUpdate(
          userId,
          { isActive },
          { new: true }
        ).select("-password");
        break;
      case "counsellor":
        user = await Counsellor.findByIdAndUpdate(
          userId,
          { isActive },
          { new: true }
        ).select("-password");
        break;
      case "volunteer":
        user = await Volunteer.findByIdAndUpdate(
          userId,
          { isActive },
          { new: true }
        ).select("-password");
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid user type" });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get system analytics
export const getSystemAnalytics = async (req, res) => {
  try {
    const { period = "30d" } = req.query;

    let startDate;
    const now = new Date();

    switch (period) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [newUsers, newReports, resolvedReports, totalBookings] =
      await Promise.all([
        Student.countDocuments({ createdAt: { $gte: startDate } }),
        Report.countDocuments({ createdAt: { $gte: startDate } }),
        Report.countDocuments({
          status: "resolved",
          resolvedAt: { $gte: startDate },
        }),
        Booking.countDocuments({ createdAt: { $gte: startDate } }),
      ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        startDate,
        endDate: now,
        metrics: {
          newUsers,
          newReports,
          resolvedReports,
          totalBookings,
          resolutionRate:
            newReports > 0
              ? ((resolvedReports / newReports) * 100).toFixed(2)
              : 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Emergency access control
export const emergencyAccess = async (req, res) => {
  try {
    const { action, userId, userType } = req.body;

     let notificationTitle = '';
    let notificationMessage = '';

    if (!req.userDetails.hasPermission("emergency_access")) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions for emergency access",
      });
    }

    let user;
    switch (userType) {
      case "student":
        user = await Student.findById(userId);
        break;
      case "counsellor":
        user = await Counsellor.findById(userId);
        break;
      case "volunteer":
        user = await Volunteer.findById(userId);
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid user type" });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (action === "suspend") {
      user.isActive = false;
      notificationTitle = 'Account Suspended';
      notificationMessage = 'Your account has been temporarily suspended by an administrator for security reasons.';
      await user.save();



    } else if (action === "activate") {
      user.isActive = true;
      notificationTitle = 'Account Reactivated';
      notificationMessage = 'Your account has been reactivated by an administrator. You can now log in again.';
      await user.save();



    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid action" });
    }


    await Notification.create({
        recipient: userId,
        recipientModel: userType.charAt(0).toUpperCase() + userType.slice(1), // Capitalize model name
        sender: req.user.id,
        senderModel: 'Admin',
        type: 'emergency_alert',
        category: 'emergency',
        title: notificationTitle,
        message: notificationMessage,
        data: { action, adminId: req.user.id }
    });

    res.status(200).json({
      success: true,
      message: `User ${
        action === "suspend" ? "suspended" : "activated"
      } successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user details by ID
export const getUserById = async (req, res) => {
  try {
    const { userId, userModel } = req.params;

    let user;
    switch (userModel) {
      case "student":
        user = await Student.findById(userId)
          .select("-password")
          .populate("counsellorConnected", "name email specialization")
          .populate("volunteerConnected", "name email")
          .populate("reports", "title status priority category");
        break;
      case "counsellor":
        user = await Counsellor.findById(userId)
          .select("-password")
          .populate("students", "name email studentCode");
        break;
      case "volunteer":
        user = await Volunteer.findById(userId).select("-password");
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid user type" });
    }

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCounsellor = async (req, res) => {
  const { name, email, password, specialization } = req.body;
  if (!name || !email || !password || !specialization) {
    return res.status(400).json({
      success: false,
      message: "Name, email, password, and specialization are required",
    });
  }

  const existing = await Counsellor.findOne({ email });
  if (existing) {
    return res
      .status(409)
      .json({ success: false, message: "Email already registered" });
  }

  const counsellor = await Counsellor.create({
    name,
    email,
    password,
    specialization,
    isActive: true, // Or false, requiring manual activation
  });

  res.status(201).json({
    success: true,
    message: "Counsellor created successfully",
    data: counsellor,
  });
};



// Add this new function to the end of the file
export const sendSystemNotification = async (req, res) => {
  try {
    const { role, title, message } = req.body;

    if (!role || !title || !message) {
      return res.status(400).json({ success: false, message: "Role, title, and message are required." });
    }

    const validRoles = ["student", "counsellor", "volunteer"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified." });
    }
    
    const Model = mongoose.model(role.charAt(0).toUpperCase() + role.slice(1));
    const users = await Model.find({ isActive: true }).select('_id');
    const recipients = users.map(u => ({ userId: u._id, userModel: Model.modelName }));

    if (recipients.length === 0) {
      return res.status(200).json({ success: true, message: `No active ${role}s to notify.` });
    }

    await Notification.createSystemNotification(recipients, 'system_announcement', title, message);

    res.status(200).json({ success: true, message: `Notification sent to ${recipients.length} ${role}s.` });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};




































// NEW: Admin Controller Functions for Advanced Analytics

// @desc    Admin triggers a new analytics snapshot generation on the Python server
// @route   POST /api/admin/analytics/generate
export const triggerAdvancedAnalyticsGeneration = async (req, res) => {
  try {
    const { period_start, period_end, filters } = req.body; // Optional date range or filters

    // Make an HTTP POST request to your Python analytic server
    const pythonServerResponse = await axios.post(
      `${ANALYTIC_SERVER_URL}/generate-analytics`,
      { period_start, period_end, filters }
    );

    // Python server returns success status, snapshot ID, and version
    if (pythonServerResponse.data.success) {
      res.status(200).json({
        success: true,
        message: pythonServerResponse.data.message,
        snapshot_id: pythonServerResponse.data.snapshot_id,
        snapshot_version: pythonServerResponse.data.snapshot_version,
      });
    } else {
      res.status(500).json({
        success: false,
        message: pythonServerResponse.data.message || "Failed to generate analytics on Python server.",
      });
    }
  } catch (error) {
    console.error("Error triggering advanced analytics generation:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: error.response?.data?.detail || error.message || "Internal Server Error during analytics trigger.",
    });
  }
};

// @desc    Retrieves the most recent analytics snapshot
// @route   GET /api/admin/analytics/advanced/latest
export const getLatestAdvancedAnalyticsSnapshot = async (req, res) => {
  try {
    const latestSnapshot = await AnalyticsSnapshot.findOne()
      .sort({ snapshotTimestamp: -1 }); // Get the most recent one

    if (!latestSnapshot) {
      return res.status(404).json({ success: false, message: "No analytics snapshots found." });
    }

    res.status(200).json({
      success: true,
      data: latestSnapshot,
    });
  } catch (error) {
    console.error("Error fetching latest analytics snapshot:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

// @desc    Retrieves a specific analytics snapshot by its ID
// @route   GET /api/admin/analytics/advanced/:snapshotId
export const getAdvancedAnalyticsSnapshotById = async (req, res) => {
  try {
    const { snapshotId } = req.params;
    const snapshot = await AnalyticsSnapshot.findById(snapshotId);

    if (!snapshot) {
      return res.status(404).json({ success: false, message: "Analytics snapshot not found." });
    }

    res.status(200).json({
      success: true,
      data: snapshot,
    });
  } catch (error) {
    console.error("Error fetching analytics snapshot by ID:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

// @desc    Retrieves a list of all available analytics snapshot versions
// @route   GET /api/admin/analytics/advanced/versions
export const getAllAnalyticsSnapshotVersions = async (req, res) => {
  try {
    const versions = await AnalyticsSnapshot.find({})
      .select('snapshotVersion snapshotTimestamp periodStart periodEnd') // Only fetch necessary fields
      .sort({ snapshotTimestamp: -1 }); // Sort by latest first

    res.status(200).json({
      success: true,
      data: versions,
    });
  } catch (error) {
    console.error("Error fetching all analytics snapshot versions:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};