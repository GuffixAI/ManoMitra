import crypto from "crypto";
import Feedback from "../models/feedback.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";

const makeHash = (studentId, targetId, targetType, secretSalt) =>
  crypto.createHash("sha256").update(`${studentId}:${targetId}:${targetType}:${secretSalt}`).digest("hex");

// Student: give rating to counsellor/volunteer (anonymous)
export const rateTarget = async (req, res, next) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;
    if (!["counsellor","volunteer"].includes(targetType)) {
      return res.status(400).json({ success:false, message:"Invalid targetType" });
    }
    if (!targetId || !rating) return res.status(400).json({ success:false, message:"targetId and rating required" });
    if (targetType === "counsellor" && !(await Counsellor.exists({ _id: targetId })))
      return res.status(404).json({ success:false, message:"Counsellor not found" });
    if (targetType === "volunteer" && !(await Volunteer.exists({ _id: targetId })))
      return res.status(404).json({ success:false, message:"Volunteer not found" });

    const raterHash = makeHash(req.user.id, targetId, targetType, process.env.JWT_SECRET);
    const existing = await Feedback.findOne({ raterHash });
    if (existing) return res.status(409).json({ success:false, message:"You have already rated this person" });

    const fb = await Feedback.create({ targetType, target: targetId, raterHash, rating, comment });
    res.status(201).json({ success:true, message:"Feedback submitted", data:{ rating: fb.rating } });
  } catch (err) { next(err); }
};

// Admin/Counsellor/Volunteer (self) – get public avg rating
export const getPublicRating = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query;
    if (!["counsellor","volunteer"].includes(targetType))
      return res.status(400).json({ success:false, message:"Invalid targetType" });

    const agg = await Feedback.aggregate([
      { $match: { targetType, target: new (await import("mongoose")).default.Types.ObjectId(targetId) } },
      { $group: { _id: "$target", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    const out = agg[0] ? { average: Number(agg[0].avg.toFixed(2)), count: agg[0].count } : { average: 0, count: 0 };
    res.status(200).json({ success:true, data: out });
  } catch (err) { next(err); }
};
