import Admin from "../models/admin.model.js";
import Student from "../models/student.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";
import Report from "../models/report.model.js";
import Booking from "../models/booking.model.js";
import { ROLES } from "../constants/roles.js";

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
      urgentReports
    ] = await Promise.all([
      Student.countDocuments({ isActive: true }),
      Counsellor.countDocuments({ isActive: true }),
      Volunteer.countDocuments({ isActive: true }),
      Report.countDocuments(),
      Booking.countDocuments(),
      Report.countDocuments({ status: "pending" }),
      Report.countDocuments({ priority: "urgent", status: { $in: ["pending", "in_progress"] } })
    ]);

    res.status(200).json({
      success: true,
      data: {
        users: {
          students: totalStudents,
          counsellors: totalCounsellors,
          volunteers: totalVolunteers
        },
        reports: {
          total: totalReports,
          pending: pendingReports,
          urgent: urgentReports
        },
        bookings: totalBookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all students with pagination and filters
export const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, department, academicYear, status } = req.query;
    
    const query = { isActive: true };
    if (search) query.name = { $regex: search, $options: 'i' };
    if (department) query.department = department;
    if (academicYear) query.academicYear = parseInt(academicYear);
    if (status) query.isActive = status === 'active';

    const students = await Student.find(query)
      .select('-password')
      .populate('counsellorConnected', 'name email specialization')
      .populate('volunteerConnected', 'name email')
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
        itemsPerPage: limit
      }
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
    if (search) query.name = { $regex: search, $options: 'i' };
    if (specialization) query.specialization = { $regex: specialization, $options: 'i' };
    if (status) query.isActive = status === 'active';

    const counsellors = await Counsellor.find(query)
      .select('-password')
      .populate('students', 'name email studentCode')
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
        itemsPerPage: limit
      }
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
    if (search) query.name = { $regex: search, $options: 'i' };
    if (availability) query.availability = availability;
    if (status) query.isActive = status === 'active';

    const volunteers = await Volunteer.find(query)
      .select('-password')
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
        itemsPerPage: limit
      }
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
      .populate('owner', 'name email studentCode')
      .populate('assignedTo', 'name email specialization')
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
        itemsPerPage: limit
      }
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
        message: "Report ID and counsellor ID are required" 
      });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor || !counsellor.isActive) {
      return res.status(404).json({ success: false, message: "Counsellor not found or inactive" });
    }

    await report.assignToCounsellor(counsellorId);
    
    res.status(200).json({ 
      success: true, 
      message: "Report assigned successfully",
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user status (activate/deactivate)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId, userType, isActive } = req.body;
    
    if (!userId || !userType || typeof isActive !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: "User ID, user type, and status are required" 
      });
    }

    let user;
    switch (userType) {
      case 'student':
        user = await Student.findByIdAndUpdate(userId, { isActive }, { new: true });
        break;
      case 'counsellor':
        user = await Counsellor.findByIdAndUpdate(userId, { isActive }, { new: true });
        break;
      case 'volunteer':
        user = await Volunteer.findByIdAndUpdate(userId, { isActive }, { new: true });
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid user type" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ 
      success: true, 
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get system analytics
export const getSystemAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate;
    const now = new Date();
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [
      newUsers,
      newReports,
      resolvedReports,
      totalBookings
    ] = await Promise.all([
      Student.countDocuments({ createdAt: { $gte: startDate } }),
      Report.countDocuments({ createdAt: { $gte: startDate } }),
      Report.countDocuments({ 
        status: 'resolved', 
        resolvedAt: { $gte: startDate } 
      }),
      Booking.countDocuments({ createdAt: { $gte: startDate } })
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
          resolutionRate: newReports > 0 ? ((resolvedReports / newReports) * 100).toFixed(2) : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Emergency access control
export const emergencyAccess = async (req, res) => {
  try {
    const { action, userId, userType } = req.body;
    
    if (!req.userDetails.hasPermission('emergency_access')) {
      return res.status(403).json({ 
        success: false, 
        message: "Insufficient permissions for emergency access" 
      });
    }

    let user;
    switch (userType) {
      case 'student':
        user = await Student.findById(userId);
        break;
      case 'counsellor':
        user = await Counsellor.findById(userId);
        break;
      case 'volunteer':
        user = await Volunteer.findById(userId);
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid user type" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (action === 'suspend') {
      user.isActive = false;
      await user.save();
    } else if (action === 'activate') {
      user.isActive = true;
      await user.save();
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    res.status(200).json({ 
      success: true, 
      message: `User ${action === 'suspend' ? 'suspended' : 'activated'} successfully`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user details by ID
export const getUserById = async (req, res) => {
  try {
    const { userId, userType } = req.params;
    
    let user;
    switch (userType) {
      case 'student':
        user = await Student.findById(userId)
          .select('-password')
          .populate('counsellorConnected', 'name email specialization')
          .populate('volunteerConnected', 'name email')
          .populate('reports', 'title status priority category');
        break;
      case 'counsellor':
        user = await Counsellor.findById(userId)
          .select('-password')
          .populate('students', 'name email studentCode');
        break;
      case 'volunteer':
        user = await Volunteer.findById(userId).select('-password');
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid user type" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};