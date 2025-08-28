import jwt from "jsonwebtoken";
import Student from "../models/student.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";
import Admin from "../models/admin.model.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    let user;
    if (decoded.role === "student") user = await Student.findById(decoded.id);
    else if (decoded.role === "counsellor") user = await Counsellor.findById(decoded.id);
    else if (decoded.role === "volunteer") user = await Volunteer.findById(decoded.id);
    else if (decoded.role === "admin") user = await Admin.findById(decoded.id);

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    req.userDetails = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
