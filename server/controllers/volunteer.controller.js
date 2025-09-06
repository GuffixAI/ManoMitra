
// FILE: server/controllers/volunteer.controller.js

import Volunteer from "../models/volunteer.model.js";
import Student from "../models/student.model.js";
import Message from "../models/message.model.js";
import Room from "../models/room.model.js";

// Get volunteer profile
export const getProfile = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.user.id)
      .select('-password');

    if (!volunteer) {
      return res.status(404).json({ success: false, message: "Volunteer not found" });
    }

    res.status(200).json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update volunteer profile
export const updateProfile = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      skills, 
      interests, 
      experience, 
      availability, 
      preferredTopics,
      contactNumber,
      profileImage
    } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (skills) updateData.skills = skills;
    if (interests) updateData.interests = interests;
    if (experience !== undefined) updateData.experience = experience;
    if (availability) updateData.availability = availability;
    if (preferredTopics) updateData.preferredTopics = preferredTopics;
    if (contactNumber) updateData.contactNumber = contactNumber;
    if (profileImage) updateData.profileImage = profileImage;

    const volunteer = await Volunteer.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: volunteer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get volunteer's dashboard data
export const getDashboardData = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.user.id);
    if (!volunteer) {
        return res.status(404).json({ success: false, message: "Volunteer not found" });
    }

    const [
      totalMessages,
      todayMessages,
      totalRooms,
    ] = await Promise.all([
      Message.countDocuments({ 
        sender: req.user.id, 
        senderModel: 'Volunteer' 
      }),
      Message.countDocuments({ 
        sender: req.user.id, 
        senderModel: 'Volunteer',
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
        } 
      }),
      Room.countDocuments({ moderators: req.user.id }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        messages: {
          total: totalMessages,
          today: todayMessages
        },
        rooms: totalRooms,
        rating: parseFloat(volunteer.averageRating),
        feedbackCount: volunteer.feedbackCount,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get volunteer's performance metrics
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
    
    const volunteer = await Volunteer.findById(req.user.id);
    if (!volunteer) {
        return res.status(404).json({ success: false, message: "Volunteer not found" });
    }

    const [
      totalMessages,
      totalRooms,
    ] = await Promise.all([
      Message.countDocuments({ 
        sender: req.user.id, 
        senderModel: 'Volunteer',
        createdAt: { $gte: startDate }
      }),
      Room.countDocuments({ 
        moderators: req.user.id 
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        startDate,
        endDate: now,
        metrics: {
          totalMessages,
          totalRooms,
          averageRating: parseFloat(volunteer.averageRating),
          feedbackCount: volunteer.feedbackCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get volunteer's moderated rooms
export const getModeratedRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ moderators: req.user.id })
      .populate('moderators', 'name email');

    res.status(200).json({
      success: true,
      data: rooms
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get volunteer's message history
export const getMessageHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, roomId } = req.query;
    
    const query = { 
      sender: req.user.id, 
      senderModel: 'Volunteer' 
    };
    
    if (roomId) query.room = roomId;

    const messages = await Message.find(query)
      .populate('room', 'topic')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(query);

    res.status(200).json({
      success: true,
      data: messages,
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

// Update volunteer's last active time
export const updateLastActive = async (req, res) => {
  try {
    await Volunteer.findByIdAndUpdate(req.user.id, {
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

// Complete volunteer training
export const completeTraining = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.user.id,
      { trainingCompleted: true },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: "Training completed successfully",
      data: volunteer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get volunteer's feedback
export const getMyFeedback = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.user.id)
      .select('feedback')
      .populate('feedback.student', 'name email studentCode');

    if (!volunteer) {
      return res.status(404).json({ success: false, message: "Volunteer not found" });
    }

    res.status(200).json({
      success: true,
      data: volunteer.feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get volunteer's availability status
export const getAvailabilityStatus = async (req, res) => {
  try {
    const volunteer = await Volunteer.findById(req.user.id)
      .select('isActive trainingCompleted maxConcurrentChats');

    if (!volunteer) {
      return res.status(404).json({ success: false, message: "Volunteer not found" });
    }

    const availabilityStatus = {
      isActive: volunteer.isActive,
      trainingCompleted: volunteer.trainingCompleted,
      maxConcurrentChats: volunteer.maxConcurrentChats,
      isAvailable: volunteer.isAvailable
    };

    res.status(200).json({
      success: true,
      data: availabilityStatus
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update volunteer's availability status
export const updateAvailabilityStatus = async (req, res) => {
  try {
    const { isActive, maxConcurrentChats } = req.body;
    
    const updateData = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (maxConcurrentChats) updateData.maxConcurrentChats = maxConcurrentChats;

    const volunteer = await Volunteer.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: "Availability status updated successfully",
      data: volunteer
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getConnectedStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    const query = { volunteerConnected: req.user.id };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const students = await Student.find(query)
      .select('name email studentCode profileImage')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Student.countDocuments(query);

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