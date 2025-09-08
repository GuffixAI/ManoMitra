// FILE: server/controllers/student.controller.js
import Student from "../models/student.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";
import Report from "../models/report.model.js";
import Booking from "../models/booking.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";
import Notification from "../models/notification.model.js"

// Get student profile
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .select("-password")
      .populate("counsellorConnected", "name email specialization")
      .populate("volunteerConnected", "name email");

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student profile
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      contactNumber,
      emergencyContact,
      dateOfBirth,
      gender,
      academicYear,
      department,
      preferences,
    } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (gender) updateData.gender = gender;
    if (academicYear) updateData.academicYear = academicYear;
    if (department) updateData.department = department;
    if (preferences) updateData.preferences = preferences;

    const student = await Student.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: student,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student's dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      totalReports,
      pendingReports,
      totalConnections,
    ] = await Promise.all([
      Booking.countDocuments({ student: req.user.id }),
      Booking.countDocuments({ student: req.user.id, status: "pending" }),
      Report.countDocuments({ owner: req.user.id }),
      Report.countDocuments({ owner: req.user.id, status: "pending" }),
      Student.findById(req.user.id).then((s) => s?.totalConnections || 0),
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
        },
        reports: {
          total: totalReports,
          pending: pendingReports,
        },
        connections: totalConnections,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get available counsellors
export const getAvailableCounsellors = asyncHandler(async (req, res, next) => {
  const { specialization, search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const query = { isActive: true };

  if (specialization && typeof specialization === "string") {
    query.specialization = { $regex: specialization, $options: "i" };
  }

  if (search && typeof search === "string") {
    query.name = { $regex: search, $options: "i" };
  }

  const counsellors = await Counsellor.find(query)
    .select("name email specialization description availableTime")
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ name: 1 });

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
});

// Get available volunteers
export const getAvailableVolunteers = asyncHandler(async (req, res, next) => {
  const { availability, search } = req.query;
  // FIX: Removed TypeScript syntax 'as string'
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));

  const query = { isActive: true };
  if (availability && typeof availability === "string") {
    query.availability = availability;
  }
  if (search && typeof search === "string") {
    query.name = { $regex: search, $options: "i" };
  }

  const volunteers = await Volunteer.find(query)
    .select(
      "name email description skills interests availability preferredTopics"
    )
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ name: 1 });

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
});

// Connect with counsellor
export const connectCounsellor = async (req, res) => {
  try {
    const { counsellorId } = req.body;

    if (!counsellorId) {
      return res.status(400).json({
        success: false,
        message: "Counsellor ID is required",
      });
    }

    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor || !counsellor.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Counsellor not found or inactive" });
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (student.counsellorConnected.includes(counsellorId)) {
      return res.status(409).json({
        success: false,
        message: "Already connected with this counsellor",
      });
    }

    await student.connectCounsellor(counsellorId);
    await counsellor.addStudent(req.user.id);

    await Notification.create({
      recipient: counsellorId,
      recipientModel: "Counsellor",
      sender: req.user.id,
      senderModel: "Student",
      type: "connection_request",
      category: "connection",
      title: "New Student Connection",
      message: `Student ${student.name} has connected with you.`,
      data: { studentId: req.user.id },
      actionUrl: `/counsellor/students`,
    });

    res.status(200).json({
      success: true,
      message: "Connected with counsellor successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Disconnect from counsellor
export const disconnectCounsellor = async (req, res) => {
  try {
    const { counsellorId } = req.params;

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (!student.counsellorConnected.includes(counsellorId)) {
      return res.status(404).json({
        success: false,
        message: "Not connected with this counsellor",
      });
    }

    await student.disconnectCounsellor(counsellorId);
    await Counsellor.findByIdAndUpdate(counsellorId, {
      $pull: { students: req.user.id },
    });

    res.status(200).json({
      success: true,
      message: "Disconnected from counsellor successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Connect with volunteer
export const connectVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.body;

    if (!volunteerId) {
      return res.status(400).json({
        success: false,
        message: "Volunteer ID is required",
      });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer || !volunteer.isActive) {
      return res.status(404).json({
        success: false,
        message: "Volunteer not found or inactive",
      });
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (student.volunteerConnected.includes(volunteerId)) {
      return res.status(409).json({
        success: false,
        message: "Already connected with this volunteer",
      });
    }

    await student.connectVolunteer(volunteerId);

    await Notification.create({
        recipient: volunteerId,
        recipientModel: 'Volunteer',
        sender: req.user.id,
        senderModel: 'Student',
        type: 'connection_request',
        category: 'connection',
        title: 'New Student Connection',
        message: `Student ${student.name} has connected with you.`,
        data: { studentId: req.user.id },
        actionUrl: `/volunteer/students`
    });

    res.status(200).json({
      success: true,
      message: "Connected with volunteer successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Disconnect from volunteer
export const disconnectVolunteer = async (req, res) => {
  try {
    const { volunteerId } = req.params;

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    if (!student.volunteerConnected.includes(volunteerId)) {
      return res.status(404).json({
        success: false,
        message: "Not connected with this volunteer",
      });
    }

    await student.disconnectVolunteer(volunteerId);

    res.status(200).json({
      success: true,
      message: "Disconnected from volunteer successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student's connections
export const getConnections = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate("counsellorConnected", "name email specialization")
      .populate("volunteerConnected", "name email description");

    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        counsellors: student.counsellorConnected,
        volunteers: student.volunteerConnected,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student preferences
export const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== "object") {
      return res.status(400).json({
        success: false,
        message: "Preferences object is required",
      });
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    await student.updatePreferences(preferences);

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student's last active time
export const updateLastActive = async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.user.id, {
      lastActive: new Date(),
    });

    res.status(200).json({
      success: true,
      message: "Last active time updated",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
