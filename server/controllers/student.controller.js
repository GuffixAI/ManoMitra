import Student from "../models/student.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";
import { generateToken } from "../auth/jwt.js";
import bcrypt from "bcryptjs";

// @desc Register Student
export const registerStudent = async (req, res, next) => {
  try {
    const { name, email, password, studentCode } = req.body;

    if (!name || !email || !password || !studentCode) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const studentExists = await Student.findOne({ email });
    if (studentExists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const student = await Student.create({ name, email, password, studentCode });
    const token = generateToken(student._id, student.role);

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      data: { student, token },
    });
  } catch (err) {
    next(err);
  }
};

// @desc Student Login
export const loginStudent = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(student._id, student.role);
    res.status(200).json({ success: true, token, data: student });
  } catch (err) {
    next(err);
  }
};

// @desc Update Student Profile
export const updateStudentProfile = async (req, res, next) => {
  try {
    const { name, password } = req.body;
    const student = await Student.findById(req.user.id);

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (name) student.name = name;
    if (password) student.password = await bcrypt.hash(password, 10);

    await student.save();
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    next(err);
  }
};

// @desc Connect Student to Counsellor
export const connectCounsellor = async (req, res, next) => {
  try {
    const { counsellorId } = req.body;
    const student = await Student.findById(req.user.id);
    const counsellor = await Counsellor.findById(counsellorId);

    if (!counsellor) {
      return res.status(404).json({ success: false, message: "Counsellor not found" });
    }

    if (!student.counsellorConnected.includes(counsellorId)) {
      student.counsellorConnected.push(counsellorId);
      counsellor.students.push(student._id);
      await student.save();
      await counsellor.save();
    }

    res.status(200).json({ success: true, message: "Counsellor connected successfully" });
  } catch (err) {
    next(err);
  }
};

// @desc Connect Student to Volunteer
export const connectVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.body;
    const student = await Student.findById(req.user.id);
    const volunteer = await Volunteer.findById(volunteerId);

    if (!volunteer) {
      return res.status(404).json({ success: false, message: "Volunteer not found" });
    }

    if (!student.volunteerConnected.includes(volunteerId)) {
      student.volunteerConnected.push(volunteerId);
      await student.save();
    }

    res.status(200).json({ success: true, message: "Volunteer connected successfully" });
  } catch (err) {
    next(err);
  }
};
