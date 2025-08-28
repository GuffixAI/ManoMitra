import Report from "../models/report.model.js";
import fs from "fs";

export const uploadMarkdownReport = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success:false, message:"No file uploaded" });

    const doc = await Report.create({
      owner: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mime: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    res.status(201).json({ success:true, message:"Report uploaded", data:doc });
  } catch (err) { next(err); }
};

export const listMyReports = async (req, res, next) => {
  try {
    const files = await Report.find({ owner: req.user.id }).select("-path");
    res.status(200).json({ success:true, data: files });
  } catch (err) { next(err); }
};

export const getMyReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await Report.findOne({ _id:id, owner: req.user.id });
    if (!file) return res.status(404).json({ success:false, message:"Report not found" });
    res.setHeader("Content-Type", file.mime || "text/markdown");
    fs.createReadStream(file.path).pipe(res);
  } catch (err) { next(err); }
};

export const deleteMyReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await Report.findOneAndDelete({ _id:id, owner: req.user.id });
    if (!file) return res.status(404).json({ success:false, message:"Report not found" });
    fs.unlink(file.path, () => {});
    res.status(200).json({ success:true, message:"Report deleted" });
  } catch (err) { next(err); }
};
