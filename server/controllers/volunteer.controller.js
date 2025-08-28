import Volunteer from "../models/volunteer.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../auth/jwt.js";

// @desc Register Volunteer
export const registerVolunteer = async (req, res, next) => {
  try {
    const { name, email, password, description } = req.body;

    const exists = await Volunteer.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Volunteer already exists" });
    }

    const volunteer = await Volunteer.create({ name, email, password, description });
    const token = generateToken(volunteer._id, volunteer.role);

    res.status(201).json({ success: true, data: volunteer, token });
  } catch (err) {
    next(err);
  }
};

// @desc Get Volunteer Rating
export const getVolunteerRating = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.user.id);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: "Volunteer not found" });
    }

    const rating = volunteer.getAverageRating();
    res.status(200).json({ success: true, rating });
  } catch (err) {
    next(err);
  }
};
