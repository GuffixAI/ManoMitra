import Feedback from "../models/feedback.model.js";
import Student from "../models/student.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";
import { ROLES } from "../constants/roles.js";
import crypto from "crypto";

// Create feedback for counsellor or volunteer
export const createFeedback = async (req, res) => {
  try {
    const { targetType, targetId, rating, comment } = req.body;
    
    if (!targetType || !targetId || !rating) {
      return res.status(400).json({ 
        success: false, 
        message: "Target type, target ID, and rating are required" 
      });
    }

    if (!["counsellor", "volunteer"].includes(targetType)) {
      return res.status(400).json({ 
        success: false, 
        message: "Target type must be 'counsellor' or 'volunteer'" 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating must be between 1 and 5" 
      });
    }

    // Check if target exists
    let target;
    if (targetType === "counsellor") {
      target = await Counsellor.findById(targetId);
    } else {
      target = await Volunteer.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({ 
        success: false, 
        message: `${targetType} not found` 
      });
    }

    // Generate unique hash for this feedback (prevents duplicate feedback)
    const feedbackHash = crypto
      .createHash('sha256')
      .update(`${req.user.id}-${targetId}-${targetType}`)
      .digest('hex');

    // Check if feedback already exists
    const existingFeedback = await Feedback.findOne({ raterHash: feedbackHash });
    if (existingFeedback) {
      return res.status(409).json({ 
        success: false, 
        message: "You have already provided feedback for this person" 
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      targetType,
      target: targetId,
      raterHash: feedbackHash,
      rating,
      comment: comment || ""
    });

    // Update target's feedback array
    if (targetType === "counsellor") {
      await Counsellor.findByIdAndUpdate(targetId, {
        $push: { 
          feedback: {
            student: req.user.id,
            rating,
            comment: comment || ""
          }
        }
      });
    } else {
      await Volunteer.findByIdAndUpdate(targetId, {
        $push: { 
          feedback: {
            student: req.user.id,
            rating,
            comment: comment || ""
          }
        }
      });
    }

    res.status(201).json({ 
      success: true, 
      message: "Feedback submitted successfully",
      data: feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get feedback for a specific counsellor or volunteer
export const getFeedback = async (req, res) => {
  try {
    const { targetType, targetId } = req.params;
    
    if (!["counsellor", "volunteer"].includes(targetType)) {
      return res.status(400).json({ 
        success: false, 
        message: "Target type must be 'counsellor' or 'volunteer'" 
      });
    }

    const feedback = await Feedback.find({ 
      targetType, 
      target: targetId 
    }).sort({ createdAt: -1 });

    // Calculate statistics
    const totalFeedback = feedback.length;
    const averageRating = totalFeedback > 0 
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1)
      : 0;

    const ratingDistribution = {
      1: feedback.filter(f => f.rating === 1).length,
      2: feedback.filter(f => f.rating === 2).length,
      3: feedback.filter(f => f.rating === 3).length,
      4: feedback.filter(f => f.rating === 4).length,
      5: feedback.filter(f => f.rating === 5).length
    };

    res.status(200).json({
      success: true,
      data: {
        feedback,
        statistics: {
          totalFeedback,
          averageRating: parseFloat(averageRating),
          ratingDistribution
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get my feedback (for students)
export const getMyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ 
      raterHash: { 
        $regex: `^${req.user.id}-` 
      } 
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update feedback
export const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    
    if (!rating && !comment) {
      return res.status(400).json({ 
        success: false, 
        message: "Rating or comment is required for update" 
      });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    // Check if user owns this feedback
    if (!feedback.raterHash.startsWith(req.user.id + '-')) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Update feedback
    if (rating) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment;

    await feedback.save();

    // Update target's feedback array
    if (feedback.targetType === "counsellor") {
      await Counsellor.findByIdAndUpdate(feedback.target, {
        $set: { 
          "feedback.$[elem].rating": feedback.rating,
          "feedback.$[elem].comment": feedback.comment
        }
      }, {
        arrayFilters: [{ "elem.student": req.user.id }]
      });
    } else {
      await Volunteer.findByIdAndUpdate(feedback.target, {
        $set: { 
          "feedback.$[elem].rating": feedback.rating,
          "feedback.$[elem].comment": feedback.comment
        }
      }, {
        arrayFilters: [{ "elem.student": req.user.id }]
      });
    }

    res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      data: feedback
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete feedback
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    // Check if user owns this feedback
    if (!feedback.raterHash.startsWith(req.user.id + '-')) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Remove feedback from target's array
    if (feedback.targetType === "counsellor") {
      await Counsellor.findByIdAndUpdate(feedback.target, {
        $pull: { feedback: { student: req.user.id } }
      });
    } else {
      await Volunteer.findByIdAndUpdate(feedback.target, {
        $pull: { feedback: { student: req.user.id } }
      });
    }

    // Delete feedback
    await Feedback.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get feedback statistics for admin
export const getFeedbackStats = async (req, res) => {
  try {
    const [counsellorStats, volunteerStats] = await Promise.all([
      Counsellor.aggregate([
        {
          $project: {
            name: 1,
            specialization: 1,
            feedbackCount: { $size: "$feedback" },
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: "$feedback" }, 0] },
                then: { $avg: "$feedback.rating" },
                else: 0
              }
            }
          }
        },
        { $sort: { averageRating: -1 } }
      ]),
      Volunteer.aggregate([
        {
          $project: {
            name: 1,
            availability: 1,
            feedbackCount: { $size: "$feedback" },
            averageRating: {
              $cond: {
                if: { $gt: [{ $size: "$feedback" }, 0] },
                then: { $avg: "$feedback.rating" },
                else: 0
              }
            }
          }
        },
        { $sort: { averageRating: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        counsellors: counsellorStats,
        volunteers: volunteerStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get top rated counsellors and volunteers
export const getTopRated = async (req, res) => {
  try {
    const { limit = 10, type } = req.query;
    
    let query = {};
    if (type && ["counsellor", "volunteer"].includes(type)) {
      query.targetType = type;
    }

    const topRated = await Feedback.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$target",
          targetType: { $first: "$targetType" },
          averageRating: { $avg: "$rating" },
          feedbackCount: { $sum: 1 }
        }
      },
      { $match: { feedbackCount: { $gte: 3 } } }, // Only show those with at least 3 feedback
      { $sort: { averageRating: -1, feedbackCount: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Populate target details
    const populatedResults = await Promise.all(
      topRated.map(async (item) => {
        let target;
        if (item.targetType === "counsellor") {
          target = await Counsellor.findById(item._id).select('name specialization');
        } else {
          target = await Volunteer.findById(item._id).select('name availability');
        }
        
        return {
          ...item,
          target: target || { name: "Unknown User" }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: populatedResults
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
