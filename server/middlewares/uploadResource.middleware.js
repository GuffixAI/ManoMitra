// server/middlewares/uploadResource.middleware.js
import multer from "multer";
import path from "path";

// Ensure the directory exists
import fs from 'fs';
const uploadDir = 'uploads/resources';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Allow common document, audio, video file types
  const allowedMimeTypes = [
    'application/pdf', // Documents
    'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg', 'audio/wav', 'audio/ogg', // Audio
    'video/mp4', 'video/webm', 'video/ogg' // Video
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Unsupported file type. Allowed: PDF, DOC, DOCX, TXT, MP3, WAV, OGG, MP4, WEBM."));
  }
};

export const uploadResourceFile = multer({ 
    storage, 
    fileFilter, 
    limits: { 
        fileSize: 20 * 1024 * 1024 // 20MB limit for general resources
    } 
});