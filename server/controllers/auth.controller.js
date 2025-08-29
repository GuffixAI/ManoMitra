import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/student.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";
import Admin from "../models/admin.model.js";
import { ROLES } from "../constants/roles.js";

// Student Authentication
export const loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const isMatch = await student.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: student._id, role: student.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
    
    res.status(200).json({ 
      success: true, 
      token, 
      user: { 
        _id: student._id,
        name: student.name, 
        email: student.email, 
        studentCode: student.studentCode,
        role: student.role
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }
    
    // Check if email exists
    const existing = await Student.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    
    // Generate studentCode (simple random)
    const studentCode = "STU" + Math.floor(100000 + Math.random() * 900000);
    const student = await Student.create({ name, email, password, studentCode });
    
    // Create JWT
    const token = jwt.sign(
      { id: student._id, role: ROLES.STUDENT }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
    
    res.status(201).json({ 
      success: true, 
      token, 
      user: { 
        _id: student._id,
        name: student.name, 
        email: student.email, 
        studentCode,
        role: student.role
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Counsellor Authentication
export const loginCounsellor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    
    const counsellor = await Counsellor.findOne({ email });
    if (!counsellor) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const isMatch = await counsellor.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: counsellor._id, role: counsellor.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
    
    res.status(200).json({ 
      success: true, 
      token, 
      user: { 
        _id: counsellor._id,
        name: counsellor.name, 
        email: counsellor.email, 
        specialization: counsellor.specialization,
        role: counsellor.role
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const registerCounsellor = async (req, res) => {
  try {
    const { name, email, password, specialization, description } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password required" });
    }
    
    // Check if email exists
    const existing = await Counsellor.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    
    const counsellor = await Counsellor.create({ 
      name, 
      email, 
      password, 
      specialization, 
      description 
    });
    
    // Create JWT
    const token = jwt.sign(
      { id: counsellor._id, role: ROLES.COUNSELLOR }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
    
    res.status(201).json({ 
      success: true, 
      token, 
      user: { 
        _id: counsellor._id,
        name: counsellor.name, 
        email: counsellor.email, 
        specialization: counsellor.specialization,
        role: counsellor.role
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Volunteer Authentication
export const loginVolunteer = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    
    const volunteer = await Volunteer.findOne({ email });
    if (!volunteer) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const isMatch = await volunteer.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: volunteer._id, role: volunteer.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
    
    res.status(200).json({ 
      success: true, 
      token, 
      user: { 
        _id: volunteer._id,
        name: volunteer.name, 
        email: volunteer.email, 
        role: volunteer.role
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const registerVolunteer = async (req, res) => {
  try {
    const { name, email, password, description } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password required" });
    }
    
    // Check if email exists
    const existing = await Volunteer.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    
    const volunteer = await Volunteer.create({ 
      name, 
      email, 
      password, 
      description 
    });
    
    // Create JWT
    const token = jwt.sign(
      { id: volunteer._id, role: ROLES.VOLUNTEER }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
    
    res.status(201).json({ 
      success: true, 
      token, 
      user: { 
        _id: volunteer._id,
        name: volunteer.name, 
        email: volunteer.email, 
        role: volunteer.role
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Admin Authentication
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }
    
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: admin._id, role: admin.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
    
    res.status(200).json({ 
      success: true, 
      token, 
      user: { 
        _id: admin._id,
        email: admin.email, 
        role: admin.role
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Universal login endpoint
export const universalLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "Email, password and role required" });
    }
    
    let user;
    switch (role) {
      case ROLES.STUDENT:
        user = await Student.findOne({ email });
        break;
      case ROLES.COUNSELLOR:
        user = await Counsellor.findOne({ email });
        break;
      case ROLES.VOLUNTEER:
        user = await Volunteer.findOne({ email });
        break;
      case ROLES.ADMIN:
        user = await Admin.findOne({ email });
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid role" });
    }
    
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
    
    // Return user data based on role
    const userData = {
      _id: user._id,
      email: user.email,
      role: user.role,
      ...(user.name && { name: user.name }),
      ...(user.studentCode && { studentCode: user.studentCode }),
      ...(user.specialization && { specialization: user.specialization }),
      ...(user.description && { description: user.description })
    };
    
    res.status(200).json({ 
      success: true, 
      token, 
      user: userData
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
