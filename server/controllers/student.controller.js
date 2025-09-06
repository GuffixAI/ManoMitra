// FILE: server/controllers/student.controller.js
import Student from "../models/student.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";
import Report from "../models/report.model.js";
import Booking from "../models/booking.model.js";
import { asyncHandler } from "../middlewares/error.middleware.js";

// Get student profile
export const getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .select('-password')
      .populate('counsellorConnected', 'name email specialization')
      .populate('volunteerConnected', 'name email');

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      data: student
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
      preferences 
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

    const student = await Student.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: student
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
      totalConnections
    ] = await Promise.all([
      Booking.countDocuments({ student: req.user.id }),
      Booking.countDocuments({ student: req.user.id, status: 'pending' }),
      Report.countDocuments({ owner: req.user.id }),
      Report.countDocuments({ owner: req.user.id, status: 'pending' }),
      Student.findById(req.user.id).then(s => s?.totalConnections || 0)
    ]);

    res.status(200).json({
      success: true,
      data: {
        bookings: {
          total: totalBookings,
          pending: pendingBookings
        },
        reports: {
          total: totalReports,
          pending: pendingReports
        },
        connections: totalConnections
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get available counsellors
// Wrap the function with asyncHandler to handle errors automatically
export const getAvailableCounsellors = asyncHandler(async (req, res, next) => {
  // 1. Destructure and set defaults
  const { specialization, search } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  // Log the raw query for debugging
  console.log("Received query params:", req.query);

  // 2. Build the query object safely
  const query = { isActive: true };

  // VALIDATION: Ensure 'specialization' is a string before adding to the query
  if (specialization && typeof specialization === 'string') {
    query.specialization = { $regex: specialization, $options: 'i' };
  }

  // VALIDATION: Ensure 'search' is a string before adding to the query
  if (search && typeof search === 'string') {
    query.name = { $regex: search, $options: 'i' };
  }

  // 3. Execute database operations
  const counsellors = await Counsellor.find(query)
    .select('name email specialization description availableTime')
    .limit(limit) // limit is already a number
    .skip((page - 1) * limit)
    .sort({ name: 1 });

  const total = await Counsellor.countDocuments(query);

  // 4. Send the successful response
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
});




// Get available volunteers
export const getAvailableVolunteers = async (req, res) => {
  try {
    const { page = 1, limit = 10, availability, search } = req.query;
    
    const query = { isActive: true, trainingCompleted: true };
    if (availability) query.availability = availability;
    if (search) query.name = { $regex: search, $options: 'i' };

    const volunteers = await Volunteer.find(query)
      .select('name email description skills interests availability preferredTopics')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Volunteer.countDocuments(query);

    res.status(200).json({
      success: true,
      data: volunteers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

    console.log(`Volunteer ${volunteers}`)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Connect with counsellor
export const connectCounsellor = async (req, res) => {
  try {
    const { counsellorId } = req.body;
    
    if (!counsellorId) {
      return res.status(400).json({ 
        success: false, 
        message: "Counsellor ID is required" 
      });
    }

    const counsellor = await Counsellor.findById(counsellorId);
    if (!counsellor || !counsellor.isActive) {
      return res.status(404).json({ success: false, message: "Counsellor not found or inactive" });
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Check if already connected
    if (student.counsellorConnected.includes(counsellorId)) {
      return res.status(409).json({ 
        success: false, 
        message: "Already connected with this counsellor" 
      });
    }

    await student.connectCounsellor(counsellorId);
    await counsellor.addStudent(req.user.id);

    res.status(200).json({
      success: true,
      message: "Connected with counsellor successfully"
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
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Check if connected
    if (!student.counsellorConnected.includes(counsellorId)) {
      return res.status(404).json({ 
        success: false, 
        message: "Not connected with this counsellor" 
      });
    }

    await student.disconnectCounsellor(counsellorId);
    await Counsellor.findByIdAndUpdate(counsellorId, {
      $pull: { students: req.user.id }
    });

    res.status(200).json({
      success: true,
      message: "Disconnected from counsellor successfully"
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
        message: "Volunteer ID is required" 
      });
    }

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer || !volunteer.isActive || !volunteer.trainingCompleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Volunteer not found, inactive, or not trained" 
      });
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Check if already connected
    if (student.volunteerConnected.includes(volunteerId)) {
      return res.status(409).json({ 
        success: false, 
        message: "Already connected with this volunteer" 
      });
    }

    await student.connectVolunteer(volunteerId);

    res.status(200).json({
      success: true,
      message: "Connected with volunteer successfully"
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
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // Check if connected
    if (!student.volunteerConnected.includes(volunteerId)) {
      return res.status(404).json({ 
        success: false, 
        message: "Not connected with this volunteer" 
      });
    }

    await student.disconnectVolunteer(volunteerId);

    res.status(200).json({
      success: true,
      message: "Disconnected from volunteer successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get student's connections
export const getConnections = async (req, res) => {
  try {
    const student = await Student.findById(req.user.id)
      .populate('counsellorConnected', 'name email specialization')
      .populate('volunteerConnected', 'name email description');

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    res.status(200).json({
      success: true,
      data: {
        counsellors: student.counsellorConnected,
        volunteers: student.volunteerConnected
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student preferences
export const updatePreferences = async (req, res) => {
  try {
    const { preferences } = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ 
        success: false, 
        message: "Preferences object is required" 
      });
    }

    const student = await Student.findById(req.user.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    await student.updatePreferences(preferences);

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student's last active time
export const updateLastActive = async (req, res) => {
  try {
    await Student.findByIdAndUpdate(req.user.id, {
      lastActive: new Date()
    });

    res.status(200).json({
      success: true,
      message: "Last active time updated"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};