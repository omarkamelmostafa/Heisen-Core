// routes/test/test-routes.js

import { Router } from "express";

import {
  healthCheck,
  testError,
  testHelmet,
  testSanitize,
  testDangerousInput,
  testSecurityComprehensive,
  getSecurityStats,
} from "../../controllers/test/test-controller.js";
// import * as testController from "../../controllers/test/test-controller.js";

const router = Router();

// Health check route
router.get("/health", healthCheck);

// Error testing routes
router.get("/error", testError);
router.get("/error/:type", testError);

// Security testing routes
router.get("/helmet", testHelmet);
router.get("/sanitize", testSanitize);
router.post("/sanitize", testSanitize);
router.get("/sanitize/:id", testSanitize);

// Dangerous input testing (be careful with this one!)
router.post("/dangerous-input", testDangerousInput);
router.get("/dangerous-input", testDangerousInput);

// Comprehensive security test
router.get("/security", testSecurityComprehensive);
router.post("/security", testSecurityComprehensive);

// Security statistics
router.get("/stats", getSecurityStats);

export default router;
