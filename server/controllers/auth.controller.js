import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Student from "../models/student.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";
import Admin from "../models/admin.model.js";
import { ROLES } from "../constants/roles.js";
import crypto from "crypto";

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
        role: admin.role,
        name: admin.name,
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
    
    console.log(`[LOGIN ATTEMPT] Role: ${role}, Email: ${email}`);

    if (!email || !password || !role) {
      return res.status(400).json({ success: false, message: "Email, password and role required" });
    }
    
    let user;
    let model;
    switch (role) {
      case ROLES.STUDENT: model = Student; break;
      case ROLES.COUNSELLOR: model = Counsellor; break;
      case ROLES.VOLUNTEER: model = Volunteer; break;
      case ROLES.ADMIN: model = Admin; break;
      default: return res.status(400).json({ success: false, message: "Invalid role" });
    }

    user = await model.findOne({ email });
    
    if (!user) {
      console.log(`[LOGIN FAILED] User not found for email: ${email}`);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    console.log(`[LOGIN INFO] User found: ${user._id}. Now checking password.`);
    
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(`[LOGIN FAILED] Password mismatch for user: ${user._id}`);
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    
    console.log(`[LOGIN SUCCESS] Password matched for user: ${user._id}. Generating token.`);

    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );
    
    const userData = {
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      ...(user.studentCode && { studentCode: user.studentCode }),
      ...(user.specialization && { specialization: user.specialization }),
    };
    
    // ** THIS IS THE FIX **
    // This line sends the successful response, token, and user data to the frontend.
    res.status(200).json({ 
      success: true, 
      token, 
      user: userData
    });
    // ** END OF FIX **

  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// Change Password for logged-in user
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "New password must be at least 6 characters long" });
        }

        let model;
        switch (req.user.role) {
            case ROLES.STUDENT: model = Student; break;
            case ROLES.COUNSELLOR: model = Counsellor; break;
            case ROLES.VOLUNTEER: model = Volunteer; break;
            case ROLES.ADMIN: model = Admin; break;
            default: return res.status(400).json({ success: false, message: "Invalid user role" });
        }
        
        const user = await model.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isMatch = await user.matchPassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Incorrect current password" });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ success: true, message: "Password updated successfully" });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        // A simple approach to find the user across collections
        const user = await Student.findOne({ email }) || 
                     await Counsellor.findOne({ email }) || 
                     await Volunteer.findOne({ email }) || 
                     await Admin.findOne({ email });

        if (!user) {
            // To prevent email enumeration, always send a success-like response
            return res.status(200).json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to user
        user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PATCH request to: \n\n ${resetUrl}`;

        // *** EMAIL SENDING LOGIC WOULD GO HERE ***
        // For now, we will log it to the console for testing.
        console.log("Password Reset URL:", resetUrl);
        
        res.status(200).json({ success: true, message: "If an account with that email exists, a reset link has been sent." });

    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const passwordResetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user = await Student.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } }) ||
                     await Counsellor.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } }) ||
                     await Volunteer.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } }) ||
                     await Admin.findOne({ passwordResetToken, passwordResetExpires: { $gt: Date.now() } });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        // Set new password
        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        res.status(200).json({ success: true, message: "Password reset successful" });

    } catch (error) {
        next(error);
    }
};