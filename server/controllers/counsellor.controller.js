import Counsellor from "../models/counsellor.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../auth/jwt.js";

// @desc Register Counsellor
export const registerCounsellor = async (req, res, next) => {
  try {
    const { name, email, password, specialization, description } = req.body;

    const exists = await Counsellor.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Counsellor already exists" });
    }

    const counsellor = await Counsellor.create({
      name,
      email,
      password,
      specialization,
      description,
    });

    const token = generateToken(counsellor._id, counsellor.role);
    res.status(201).json({ success: true, data: counsellor, token });
  } catch (err) {
    next(err);
  }
};

// @desc Set Availability
export const setAvailability = async (req, res, next) => {
  try {
    const { availableTime } = req.body;
    const counsellor = await Counsellor.findById(req.user.id);

    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    counsellor.availableTime = availableTime;
    await counsellor.save();
    res.status(200).json({ success: true, message: "Availability updated successfully" });
  } catch (err) {
    next(err);
  }
};

// @desc Get Counsellor Ratings
export const getCounsellorRating = async (req, res, next) => {
  try {
    const counsellor = await Counsellor.findById(req.user.id);
    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    const rating = counsellor.getAverageRating();
    res.status(200).json({ success: true, rating });
  } catch (err) {
    next(err);
  }
};


export const getAvailability = async (req, res, next) => {
  try {
    const { counsellorId } = req.params;
    const counsellor = await Counsellor.findById(counsellorId).select("availableTime");

    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    res.status(200).json({ success: true, data: counsellor.availableTime });
  } catch (err) {
    next(err);
  }
};