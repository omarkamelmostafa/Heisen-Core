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
import { emailChangeLimiter, changePasswordLimiter, toggle2faLimiter } from "../../middleware/security/rate-limiters.js";
import { emailChangeValidationRules, updatePasswordValidationRules, toggle2faValidationRules } from "../../validators/validationRules.js";
import { handleRequestEmailChange, handleConfirmEmailChange } from "../../controllers/user/email-change.controller.js";
import { handleChangePassword } from "../../controllers/user/change-password.controller.js";
import { handleToggle2fa } from "../../controllers/user/toggle-2fa.controller.js";
import { handleAvatarUpload } from "../../middleware/upload/multer-middleware.js";
import { avatarUploadLimiter } from "../../middleware/security/rate-limiters.js";
import { handleUploadAvatar } from "../../controllers/user/upload-avatar.controller.js";

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

// POST /api/v1/user/email/request
router.post(
  "/email/request",
  emailChangeLimiter,
  authTokenMiddleware,
  emailChangeValidationRules,
  handleValidationErrors,
  handleRequestEmailChange
);

// GET /api/v1/user/email/confirm/:token
// NO auth, NO rate limiter, NO validation middleware
router.get(
  "/email/confirm/:token",
  handleConfirmEmailChange
);

// POST /api/v1/user/security/password
router.post(
  "/security/password",
  changePasswordLimiter,
  authTokenMiddleware,
  updatePasswordValidationRules,
  handleValidationErrors,
  handleChangePassword
);

// PATCH /api/v1/user/security/2fa
router.patch(
  "/security/2fa",
  toggle2faLimiter,
  authTokenMiddleware,
  toggle2faValidationRules,
  handleValidationErrors,
  handleToggle2fa
);

export default router;
