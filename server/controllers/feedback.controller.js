// server/controllers/feedback.controller.js
import Feedback from "../models/feedback.model.js";
import Counsellor from "../models/counsellor.model.js";
import Volunteer from "../models/volunteer.model.js";
import crypto from "crypto";
import Notification from "../models/notification.model.js";

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

    // CORRECTED: Capitalize the targetType to match the model name for refPath population.
    const modelName = targetType.charAt(0).toUpperCase() + targetType.slice(1);
    let target;
    if (modelName === "Counsellor") {
      target = await Counsellor.findById(targetId);
    } else {
      target = await Volunteer.findById(targetId);
    }

    if (!target) {
      return res.status(404).json({ 
        success: false, 
        message: `${modelName} not found` 
      });
    }

    const feedbackHash = crypto
      .createHash('sha256')
      .update(`${req.user.id}-${targetId}-${targetType}`)
      .digest('hex');

    const existingFeedback = await Feedback.findOne({ raterHash: feedbackHash });
    if (existingFeedback) {
      return res.status(409).json({ 
        success: false, 
        message: "You have already provided feedback for this person" 
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      rater: req.user.id,
      targetType: modelName, // Use the capitalized model name
      target: targetId,
      raterHash: feedbackHash,
      rating,
      comment: comment || ""
    });

    if (modelName === "Counsellor") {
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

    await Notification.create({
        recipient: targetId,
        recipientModel: modelName,
        sender: req.user.id,
        senderModel: 'Student',
        type: 'feedback_received',
        category: 'feedback',
        title: 'You Received New Feedback!',
        message: `${rater ? rater.name : 'A student'} left you a ${rating}-star rating.`,
        data: { feedbackId: feedback._id, rating },
        actionUrl: `/${targetType}/feedback`
    });

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

    // CORRECTED: Capitalize the targetType to match the model name for querying.
    const modelName = targetType.charAt(0).toUpperCase() + targetType.slice(1);

    const feedback = await Feedback.find({ 
      targetType: modelName, 
      target: targetId 
    }).sort({ createdAt: -1 });

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
    const feedback = await Feedback.find({ rater: req.user.id }) 
    .populate('target', 'name')
    .sort({ createdAt: -1 });

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
    if (feedback.rater.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (rating) feedback.rating = rating;
    if (comment !== undefined) feedback.comment = comment;

    await feedback.save();

    if (feedback.targetType === "Counsellor") {
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

    if (feedback.rater.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (feedback.targetType === "Counsellor") {
      await Counsellor.findByIdAndUpdate(feedback.target, {
        $pull: { feedback: { student: req.user.id } }
      });
    } else {
      await Volunteer.findByIdAndUpdate(feedback.target, {
        $pull: { feedback: { student: req.user.id } }
      });
    }

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
      query.targetType = type.charAt(0).toUpperCase() + type.slice(1);
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
      { $match: { feedbackCount: { $gte: 3 } } },
      { $sort: { averageRating: -1, feedbackCount: -1 } },
      { $limit: parseInt(limit) }
    ]);

    const populatedResults = await Promise.all(
      topRated.map(async (item) => {
        let target;
        if (item.targetType === "Counsellor") {
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