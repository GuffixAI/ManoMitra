import Room from "../models/room.model.js";
import Message from "../models/message.model.js";
import { PEER_TOPICS } from "../constants/peer.js";

// Get all available rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate('moderators', 'name email');
    
    // Add default rooms for topics that don't exist yet
    const existingTopics = rooms.map(room => room.topic);
    const missingTopics = PEER_TOPICS.filter(topic => !existingTopics.includes(topic));
    
    const defaultRooms = missingTopics.map(topic => ({
      _id: null,
      topic,
      description: `Support room for ${topic}`,
      moderators: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const allRooms = [...rooms, ...defaultRooms];

    res.status(200).json({
      success: true,
      data: allRooms
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get room by topic
export const getRoomByTopic = async (req, res) => {
  try {
    const { topic } = req.params;
    
    if (!PEER_TOPICS.includes(topic)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid topic" 
      });
    }

    let room = await Room.findOne({ topic }).populate('moderators', 'name email');
    
    if (!room) {
      // Create room if it doesn't exist
      room = await Room.create({ 
        topic, 
        description: `Support room for ${topic}` 
      });
    }

    res.status(200).json({
      success: true,
      data: room
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get room messages with pagination
export const getRoomMessages = async (req, res) => {
  try {
    const { topic } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    if (!PEER_TOPICS.includes(topic)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid topic" 
      });
    }

    let room = await Room.findOne({ topic });
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const safeLimit = Math.min(Math.max(parseInt(limit) || 50, 1), 100);
    const safeOffset = Math.max(parseInt(page) - 1, 0) * safeLimit;

    const messages = await Message.find({ room: room._id })
      .populate('sender', 'name')
      .sort({ createdAt: -1 })
      .skip(safeOffset)
      .limit(safeLimit);

    const total = await Message.countDocuments({ room: room._id });

    res.status(200).json({
      success: true,
      data: {
        room,
        messages: messages.reverse(),
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / safeLimit),
          totalItems: total,
          itemsPerPage: safeLimit
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get room statistics
export const getRoomStats = async (req, res) => {
  try {
    const { topic } = req.params;
    
    if (!PEER_TOPICS.includes(topic)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid topic" 
      });
    }

    let room = await Room.findOne({ topic });
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const [totalMessages, todayMessages, uniqueUsers] = await Promise.all([
      Message.countDocuments({ room: room._id }),
      Message.countDocuments({ 
        room: room._id, 
        createdAt: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
        } 
      }),
      Message.distinct('sender', { room: room._id })
    ]);

    res.status(200).json({
      success: true,
      data: {
        room,
        stats: {
          totalMessages,
          todayMessages,
          uniqueUsers: uniqueUsers.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add moderator to room (admin only)
export const addModerator = async (req, res) => {
  try {
    const { topic, volunteerId } = req.body;
    
    if (!topic || !volunteerId) {
      return res.status(400).json({ 
        success: false, 
        message: "Topic and volunteer ID are required" 
      });
    }

    if (!PEER_TOPICS.includes(topic)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid topic" 
      });
    }

    let room = await Room.findOne({ topic });
    if (!room) {
      room = await Room.create({ 
        topic, 
        description: `Support room for ${topic}` 
      });
    }

    if (room.moderators.includes(volunteerId)) {
      return res.status(409).json({ 
        success: false, 
        message: "Volunteer is already a moderator for this room" 
      });
    }

    room.moderators.push(volunteerId);
    await room.save();

    const populatedRoom = await Room.findById(room._id).populate('moderators', 'name email');

    res.status(200).json({
      success: true,
      message: "Moderator added successfully",
      data: populatedRoom
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove moderator from room (admin only)
export const removeModerator = async (req, res) => {
  try {
    const { topic, volunteerId } = req.params;
    
    if (!PEER_TOPICS.includes(topic)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid topic" 
      });
    }

    const room = await Room.findOne({ topic });
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    if (!room.moderators.includes(volunteerId)) {
      return res.status(404).json({ 
        success: false, 
        message: "Volunteer is not a moderator for this room" 
      });
    }

    room.moderators = room.moderators.filter(
      id => id.toString() !== volunteerId
    );
    await room.save();

    const populatedRoom = await Room.findById(room._id).populate('moderators', 'name email');

    res.status(200).json({
      success: true,
      message: "Moderator removed successfully",
      data: populatedRoom
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update room description (admin only)
export const updateRoomDescription = async (req, res) => {
  try {
    const { topic } = req.params;
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ 
        success: false, 
        message: "Description is required" 
      });
    }

    if (!PEER_TOPICS.includes(topic)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid topic" 
      });
    }

    let room = await Room.findOne({ topic });
    if (!room) {
      room = await Room.create({ 
        topic, 
        description 
      });
    } else {
      room.description = description;
      await room.save();
    }

    res.status(200).json({
      success: true,
      message: "Room description updated successfully",
      data: room
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get room activity (recent messages and user count)
export const getRoomActivity = async (req, res) => {
  try {
    const { topic } = req.params;
    const { hours = 24 } = req.query;
    
    if (!PEER_TOPICS.includes(topic)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid topic" 
      });
    }

    let room = await Room.findOne({ topic });
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found" });
    }

    const timeThreshold = new Date(Date.now() - parseInt(hours) * 60 * 60 * 1000);

    const [recentMessages, activeUsers] = await Promise.all([
      Message.find({ 
        room: room._id, 
        createdAt: { $gte: timeThreshold } 
      })
        .populate('sender', 'name')
        .sort({ createdAt: -1 })
        .limit(20),
      Message.distinct('sender', { 
        room: room._id, 
        createdAt: { $gte: timeThreshold } 
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        room,
        activity: {
          recentMessages,
          activeUsers: activeUsers.length,
          timeWindow: `${hours} hours`
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



// ADDED: Create a new room (admin only)
export const createRoom = async (req, res) => {
  try {
    const { topic, description } = req.body;
    
    if (!topic || !description) {
      return res.status(400).json({ 
        success: false, 
        message: "Topic and description are required" 
      });
    }

    if (PEER_TOPICS.includes(topic)) {
        return res.status(409).json({
            success: false,
            message: "A default room with this topic already exists."
        });
    }

    const existingRoom = await Room.findOne({ topic });
    if (existingRoom) {
      return res.status(409).json({ 
        success: false, 
        message: "A room with this topic already exists" 
      });
    }

    const room = await Room.create({ topic, description });

    res.status(201).json({
      success: true,
      message: "Room created successfully",
      data: room
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};