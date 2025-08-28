import Admin from "../models/admin.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";
import { generateToken } from "../auth/jwt.js";
import bcrypt from "bcryptjs";

// @desc Admin Login
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ success: false, message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(admin._id, admin.role);
    res.status(200).json({ success: true, token });
  } catch (err) {
    next(err);
  }
};

// @desc Appoint Counsellor
export const appointCounsellor = async (req, res, next) => {
  try {
    const { counsellorId } = req.body;
    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    admin.counsellors.push(counsellorId);
    await admin.save();

    res.status(200).json({ success: true, message: "Counsellor appointed successfully" });
  } catch (err) {
    next(err);
  }
};

// @desc Appoint Volunteer
export const appointVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.body;
    const admin = await Admin.findById(req.user.id);

    if (!admin) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    admin.volunteers.push(volunteerId);
    await admin.save();

    res.status(200).json({ success: true, message: "Volunteer appointed successfully" });
  } catch (err) {
    next(err);
  }
};


// Admin: list all counsellors
export const listCounsellors = async (req, res, next) => {
  try {
    const data = await Counsellor.find().select("_id name email specialization");
    res.status(200).json({ success:true, data });
  } catch (err) { next(err); }
};

// Admin: list all volunteers
export const listVolunteers = async (req, res, next) => {
  try {
    const data = await Volunteer.find().select("_id name email description");
    res.status(200).json({ success:true, data });
  } catch (err) { next(err); }
};