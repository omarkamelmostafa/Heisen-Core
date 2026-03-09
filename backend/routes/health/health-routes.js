import { Router } from "express";
import { healthCheck } from "../../controllers/health/health.controller.js";

const router = Router();

// Production health check — no authentication required
router.get("/", healthCheck);

export default router;
