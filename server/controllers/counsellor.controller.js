import Counsellor from "../models/counsellor.model.js";
import Student from "../models/student.model.js";
import Booking from "../models/booking.model.js";
import Report from "../models/report.model.js";

// Get counsellor profile
export const getProfile = async (req, res) => {
  try {
    const counsellor = await Counsellor.findById(req.user.id)
      .select('-password')
      .populate('students', 'name email studentCode');

    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    res.status(200).json({
      success: true,
      data: counsellor // UPDATED: Ensure consistent data wrapping
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update counsellor profile
export const updateProfile = async (req, res) => {
  try {
    const { name, specialization, description, availableTime, contactNumber, emergencyContact } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (specialization) updateData.specialization = specialization;
    if (description) updateData.description = description;
    if (availableTime) updateData.availableTime = availableTime;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (emergencyContact) updateData.emergencyContact = emergencyContact;

    const counsellor = await Counsellor.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: counsellor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get counsellor's students
export const getMyStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    // UPDATED: Correct population logic to get total count accurately
    const counsellor = await Counsellor.findById(req.user.id);
    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    const studentQuery = { _id: { $in: counsellor.students } };
    if (search) {
      studentQuery.name = { $regex: search, $options: 'i' };
    }

    const students = await Student.find(studentQuery)
      .select('name email studentCode department academicYear lastActive')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Student.countDocuments(studentQuery);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get counsellor's schedule
export const getSchedule = async (req, res) => {
  try {
    const { date } = req.query;
    
    const counsellor = await Counsellor.findById(req.user.id);
    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    // Get bookings for the specified date
    let query = { counsellor: req.user.id };
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query.start = { $gte: startOfDay, $lte: endOfDay };
    }

    const bookings = await Booking.find(query)
      .populate('student', 'name email studentCode')
      .sort({ start: 1 });

    res.status(200).json({
      success: true,
      data: {
        availableTime: counsellor.availableTime,
        bookings
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a specific counsellor's availability (for students)
export const getAvailabilityById = async (req, res) => {
    try {
        const { id } = req.params;
        const counsellor = await Counsellor.findById(id).select('availableTime');
        if (!counsellor) {
            return res.status(404).json({ success: false, message: "Counsellor not found" });
        }
        res.status(200).json({ success: true, data: counsellor.availableTime });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update counsellor's availability
export const updateAvailability = async (req, res) => {
  try {
    const { availableTime } = req.body;
    
    if (!availableTime || !Array.isArray(availableTime)) {
      return res.status(400).json({ 
        success: false, 
        message: "Available time must be an array" 
      });
    }

    const counsellor = await Counsellor.findByIdAndUpdate(
      req.user.id,
      { availableTime },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: counsellor
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get counsellor's reports
export const getMyReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    
    const query = { assignedTo: req.user.id };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const reports = await Report.find(query)
      .populate('owner', 'name email studentCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get counsellor's performance metrics
export const getPerformanceMetrics = async (req, res) => {
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
      totalBookings,
      completedBookings,
      totalReports,
      resolvedReports,
      averageRating
    ] = await Promise.all([
      Booking.countDocuments({ 
        counsellor: req.user.id, 
        createdAt: { $gte: startDate } 
      }),
      Booking.countDocuments({ 
        counsellor: req.user.id, 
        status: 'completed',
        createdAt: { $gte: startDate }
      }),
      Report.countDocuments({ 
        assignedTo: req.user.id, 
        createdAt: { $gte: startDate } 
      }),
      Report.countDocuments({ 
        assignedTo: req.user.id, 
        status: 'resolved',
        createdAt: { $gte: startDate }
      }),
      Counsellor.findById(req.user.id).then(c => c?.getAverageRating() || 0)
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        startDate,
        endDate: now,
        metrics: {
          totalBookings,
          completedBookings,
          completionRate: totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(2) : 0,
          totalReports,
          resolvedReports,
          resolutionRate: totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(2) : 0,
          averageRating: parseFloat(averageRating)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add student to counsellor's list
export const addStudent = async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ 
        success: false, 
        message: "Student ID is required" 
      });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const counsellor = await Counsellor.findById(req.user.id);
    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    // Check if counsellor can take more students
    if (counsellor.currentStudentCount >= counsellor.maxStudents) {
      return res.status(400).json({ 
        success: false, 
        message: "Maximum student limit reached" 
      });
    }

    // Check if student is already connected
    if (counsellor.students.includes(studentId)) {
      return res.status(409).json({ 
        success: false, 
        message: "Student is already connected" 
      });
    }

    await counsellor.addStudent(studentId);
    await student.connectCounsellor(req.user.id);

    res.status(200).json({
      success: true,
      message: "Student added successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove student from counsellor's list
export const removeStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const counsellor = await Counsellor.findById(req.user.id);
    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    // Check if student is connected
    if (!counsellor.students.includes(studentId)) {
      return res.status(404).json({ 
        success: false, 
        message: "Student is not connected" 
      });
    }

    await counsellor.removeStudent(studentId);
    await Student.findByIdAndUpdate(studentId, {
      $pull: { counsellorConnected: req.user.id }
    });

    res.status(200).json({
      success: true,
      message: "Student removed successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// **IMPROVEMENT:** Renamed from getDashboardData for consistency with API wrapper
export const getDashboard = async (req, res) => {
  try {
    const [
      totalStudents,
      totalBookings,
      pendingBookings,
      totalReports,
      pendingReports,
      urgentReports
    ] = await Promise.all([
      Counsellor.findById(req.user.id).then(c => c?.students?.length || 0),
      Booking.countDocuments({ counsellor: req.user.id }),
      Booking.countDocuments({ counsellor: req.user.id, status: 'pending' }),
      Report.countDocuments({ assignedTo: req.user.id }),
      Report.countDocuments({ assignedTo: req.user.id, status: 'pending' }),
      Report.countDocuments({ 
        assignedTo: req.user.id, 
        priority: 'urgent', 
        status: { $in: ['pending', 'in_progress'] } 
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        students: totalStudents,
        bookings: {
          total: totalBookings,
          pending: pendingBookings
        },
        reports: {
          total: totalReports,
          pending: pendingReports,
          urgent: urgentReports
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};