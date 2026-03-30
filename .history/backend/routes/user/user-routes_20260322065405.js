import express from "express";
import { getCurrentUser } from "../../controllers/user/user.controller.js";
import { updateProfile } from "../../controllers/user/update-profile.controller.js";
import { authTokenMiddleware } from "../../middleware/auth/authTokenMiddleware.js";
import {
  userMeLimiter,
  updateProfileLimiter
} from "../../middleware/security/rate-limiters.js";
import { updateProfileValidationRules } from "../../validators/validationRules.js";
import { handleValidationErrors } from "../../middleware/validation/validation-middleware.js";

const router = express.Router();

// GET /api/v1/user/me
router.get("/me", userMeLimiter, authTokenMiddleware, getCurrentUser);

// PATCH /api/v1/user/me
router.patch(
  "/me",
  updateProfileLimiter,
  authTokenMiddleware,
  updateProfileValidationRules,
  handleValidationErrors,
  updateProfile
);

export default router;
