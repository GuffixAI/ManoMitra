// server/routes/intervention.routes.js
import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { ROLES } from "../constants/roles.js";
import { 
  createIntervention, 
  getAllInterventions, 
  updateIntervention, 
  deleteIntervention 
} from "../controllers/intervention.controller.js";

const router = express.Router();

// All routes are protected and for Admins only
router.use(protect, requireRole([ROLES.ADMIN]));

router.route('/')
  .post(createIntervention)
  .get(getAllInterventions);

router.route('/:id')
  .put(updateIntervention)
  .delete(deleteIntervention);

export default router;

