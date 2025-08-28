import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/reports"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/markdown" || file.mimetype === "text/plain" || file.originalname.endsWith(".md")) {
    cb(null, true);
  } else {
    cb(new Error("Only Markdown (.md) files are allowed"));
  }
};

export const uploadReport = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } }); // 2MB
