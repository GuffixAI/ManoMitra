import Room from "../models/room.model.js";
import Volunteer from "../models/volunteer.model.js";
import { PEER_TOPICS } from "../constants/peer.js";

// Admin: create a room (topic must be in PEER_TOPICS)
export const createRoom = async (req, res, next) => {
  try {
    const { topic, description = "" } = req.body;
    if (!topic || !PEER_TOPICS.includes(topic)) {
      return res.status(400).json({ success:false, message:"Invalid or missing topic" });
    }
    const exists = await Room.findOne({ topic });
    if (exists) return res.status(409).json({ success:false, message:"Room for topic already exists" });

    const room = await Room.create({ topic, description, moderators: [] });
    res.status(201).json({ success:true, message:"Room created", data: room });
  } catch (err) { next(err); }
};

// Any authenticated user: list rooms
export const listRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().select("_id topic description moderators");
    res.status(200).json({ success:true, data: rooms });
  } catch (err) { next(err); }
};

// Admin: add a moderator (volunteer) to a room
export const addModerator = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { volunteerId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success:false, message:"Room not found" });

    const volExists = await Volunteer.exists({ _id: volunteerId });
    if (!volExists) return res.status(404).json({ success:false, message:"Volunteer not found" });

    if (!room.moderators.find(id => id.toString() === volunteerId)) {
      room.moderators.push(volunteerId);
      await room.save();
    }
    res.status(200).json({ success:true, message:"Moderator added", data: room });
  } catch (err) { next(err); }
};

// Admin: remove a moderator (volunteer) from a room
export const removeModerator = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { volunteerId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success:false, message:"Room not found" });

    room.moderators = room.moderators.filter(id => id.toString() !== volunteerId);
    await room.save();
    res.status(200).json({ success:true, message:"Moderator removed", data: room });
  } catch (err) { next(err); }
};
