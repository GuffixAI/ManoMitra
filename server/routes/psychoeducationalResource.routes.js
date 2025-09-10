// server/routes/psychoeducationalResource.routes.js
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { createResource, getAllResources, getResourceById, updateResource, deleteResource, getRecommendedResources } from "../controllers/psychoeducationalResource.controller.js";
import { uploadResourceFile } from '../middlewares/uploadResource.middleware.js'; // Your new Multer middleware

const router = express.Router();

// Public routes (for students/counsellors to view)
router.get("/", protect, getAllResources); // Get all (can be filtered)
router.get("/recommended", protect, getRecommendedResources); // Get recommended by AI topics
router.get("/:id", protect, getResourceById); // Get single resource

// Admin-only routes for management
router.use(protect, requireRole([ROLES.ADMIN]));
router.post("/", uploadResourceFile.single('resourceFile'), createResource); // Use multer for POST
router.put("/:id", uploadResourceFile.single('resourceFile'), updateResource); // Use multer for PUT/PATCH
router.delete("/:id", deleteResource);

export default router;