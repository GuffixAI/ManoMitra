// FILE: server/controllers/report.controller.js

import Report from "../models/report.model.js";

// Renamed and updated to create a report from text content
export const createMarkdownReport = async (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Title and content are required" });
    }

    const doc = await Report.create({
      owner: req.user.id,
      title,
      content,
    });
    
    // Don't send the full content back in the creation response to save bandwidth
    const responseDoc = doc.toObject();
    delete responseDoc.content;

    res.status(201).json({ success: true, message: "Report saved", data: responseDoc });
  } catch (err) { next(err); }
};

export const listMyReports = async (req, res, next) => {
  try {
    // Select all fields except 'content' for the list view
    const files = await Report.find({ owner: req.user.id }).select("-content");
    res.status(200).json({ success: true, data: files });
  } catch (err) { next(err); }
};

export const getMyReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await Report.findOne({ _id: id, owner: req.user.id });
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    // Return the full document including content
    res.status(200).json({ success: true, data: report });
  } catch (err) { next(err); }
};

export const deleteMyReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const report = await Report.findOneAndDelete({ _id: id, owner: req.user.id });
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }
    res.status(200).json({ success: true, message: "Report deleted" });
  } catch (err) { next(err); }
};