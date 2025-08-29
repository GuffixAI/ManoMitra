// FILE: server/controllers/report.controller.js

import Report from "../models/report.model.js";
import Student from "../models/student.model.js";
import Counsellor from "../models/counsellor.model.js";

// Student: Create a new report
export const createReport = async (req, res) => {
  try {
    const { title, content, category, priority, isAnonymous, tags } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ 
        success: false, 
        message: "Title, content, and category are required" 
      });
    }

    const report = await Report.create({
      owner: req.user.id,
      title,
      content,
      category,
      priority: priority || "medium",
      isAnonymous: isAnonymous || false,
      tags: tags || []
    });

    // Add report to student's reports array
    await Student.findByIdAndUpdate(req.user.id, {
      $push: { reports: report._id }
    });

    res.status(201).json({ 
      success: true, 
      message: "Report created successfully",
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student: Get all their reports
export const getMyReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, priority } = req.query;
    
    const query = { owner: req.user.id };
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    const reports = await Report.find(query)
      .populate('assignedTo', 'name email specialization')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student: Get a specific report
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id)
      .populate('owner', 'name email studentCode')
      .populate('assignedTo', 'name email specialization');

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Check if the student owns this report
    if (report.owner._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student: Update their report
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, priority, tags } = req.body;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Check if the student owns this report
    if (report.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Only allow updates if report is pending
    if (report.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot update report that is not pending" 
      });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      { title, content, category, priority, tags },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Report updated successfully",
      data: updatedReport
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Student: Delete their report
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Check if the student owns this report
    if (report.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Only allow deletion if report is pending
    if (report.status !== "pending") {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete report that is not pending" 
      });
    }

    await Report.findByIdAndDelete(id);

    // Remove report from student's reports array
    await Student.findByIdAndUpdate(req.user.id, {
      $pull: { reports: id }
    });

    res.status(200).json({
      success: true,
      message: "Report deleted successfully"
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Counsellor: Get reports assigned to them
export const getAssignedReports = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority } = req.query;
    
    const query = { assignedTo: req.user.id };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const reports = await Report.find(query)
      .populate('owner', 'name email studentCode')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Counsellor: Update report status and add resolution notes
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Status is required" 
      });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Check if the counsellor is assigned to this report
    if (report.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // Update report status
    if (status === "resolved") {
      await report.resolve(resolutionNotes || "");
    } else {
      report.status = status;
      if (status === "closed") {
        report.resolvedAt = new Date();
      }
      await report.save();
    }

    res.status(200).json({
      success: true,
      message: `Report ${status} successfully`,
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Counsellor: Get report details
export const getReportDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id)
      .populate('owner', 'name email studentCode')
      .populate('assignedTo', 'name email specialization');

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Check if the counsellor is assigned to this report
    if (report.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get urgent reports (for counsellors and admins)
export const getUrgentReports = async (req, res) => {
  try {
    const reports = await Report.getUrgent();
    
    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reports by status
export const getReportsByStatus = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: "Status is required" 
      });
    }

    const reports = await Report.getByStatus(status)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments({ status });

    res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};