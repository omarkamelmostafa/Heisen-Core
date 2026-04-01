// backend/routes/auth/auth-routes.js
import { body } from "express-validator";
import express from "express";
import { handleRegister } from "../../controllers/auth/register.controller.js";
import { handleLogin } from "../../controllers/auth/login.controller.js";
import { handleLogout } from "../../controllers/auth/logout.controller.js";
import { handleLogoutAll } from "../../controllers/auth/logout-all.controller.js";
import { handleRefreshToken } from "../../controllers/auth/refresh.controller.js";
import { handleVerifyEmail } from "../../controllers/auth/verify-email.controller.js";
import {
  handleForgotPassword,
  handleResetPassword,
} from "../../controllers/auth/password-reset.controller.js";
import { handleResendVerification } from "../../controllers/auth/resend-verification.controller.js";
import { handleVerify2fa } from "../../controllers/auth/verify-2fa.controller.js";
import { handleResend2fa } from "../../controllers/auth/resend-2fa.controller.js";
import { handleValidationErrors } from "../../middleware/validation/index.js";
import {
  emailVerificationValidationRules,
  forgotPasswordValidationRules,
  loginValidationRules,
  registerValidationRules,
  resetPasswordValidationRules,
  resendVerificationValidationRules,
  verify2faValidationRules,
} from "../../validators/index.js";
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  refreshLimiter,
  resetPasswordLimiter,
  verifyEmailLimiter,
  resendVerificationLimiter,
  logoutLimiter,
  verify2faLimiter,
  resend2faLimiter,
} from "../../middleware/security/rate-limiters.js";
import { authTokenMiddleware } from "../../middleware/auth/authTokenMiddleware.js";

const router = express.Router();

router
  .route("/login")
  .post(loginLimiter, loginValidationRules, handleValidationErrors, handleLogin);

// POST /api/v1/auth/verify-2fa
router.post(
  "/verify-2fa",
  verify2faLimiter,
  verify2faValidationRules,
  handleValidationErrors,
  handleVerify2fa
);

// POST /api/v1/auth/resend-2fa
router.post(
  "/resend-2fa",
  resend2faLimiter,
  [
    body("tempToken")
      .notEmpty()
      .withMessage("Verification session token is required")
      .bail()
      .isString()
      .withMessage("Invalid token format"),
  ],
  handleValidationErrors,
  handleResend2fa
);

router
  .route("/register")
  .post(registerLimiter, registerValidationRules, handleValidationErrors, handleRegister);

router.route("/logout").post(logoutLimiter, handleLogout);
router.route("/logout-all").post(logoutLimiter, authTokenMiddleware, handleLogoutAll);
router.route("/refresh").post(refreshLimiter, handleRefreshToken);

router
  .route("/verify-email")
  .post(
    verifyEmailLimiter,
    emailVerificationValidationRules,
    handleValidationErrors,
    handleVerifyEmail
  );

router
  .route("/resend-verification")
  .post(
    resendVerificationLimiter,
    resendVerificationValidationRules,
    handleValidationErrors,
    handleResendVerification
  );

router
  .route("/forgot-password")
  .post(
    forgotPasswordLimiter,
    forgotPasswordValidationRules,
    handleValidationErrors,
    handleForgotPassword
  );

router
  .route("/reset-password")
  .post(
    resetPasswordLimiter,
    resetPasswordValidationRules,
    handleValidationErrors,
    handleResetPassword
  );

export default router;
