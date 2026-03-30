import { Router } from "express";
import { healthCheck } from "../../controllers/health/health.controller.js";
import { healthLimiter } from "../../middleware/security/rate-limiters.js";

const router = Router();

// Production health check — no authentication required
router.get("/", healthLimiter, healthCheck);

export default router;
