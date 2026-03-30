import express from "express";
import { handleRegister } from "../../controllers/auth/register.controller.js";
import { handleLogin } from "../../controllers/auth/login.controller.js";
import { handleLogout } from "../../controllers/auth/logout.controller.js";
import { handleRefreshToken } from "../../controllers/auth/refresh.controller.js";
import { handleVerifyEmail } from "../../controllers/auth/verify-email.controller.js";
import {
  handleForgotPassword,
  handleResetPassword,
} from "../../controllers/auth/password-reset.controller.js";
import { handleValidationErrors } from "../../middleware/validation/index.js";
import {
  emailVerificationValidationRules,
  forgotPasswordValidationRules,
  loginValidationRules,
  registerValidationRules,
  resetPasswordValidationRules,
} from "../../validators/validationRules.js";

const router = express.Router();

router
  .route("/login")
  .post(loginValidationRules, handleValidationErrors, handleLogin);

router
  .route("/register")
  .post(registerValidationRules, handleValidationErrors, handleRegister);

router.route("/logout").get(handleLogout);
router.route("/refresh").get(handleRefreshToken);

router
  .route("/verify-email")
  .post(
    emailVerificationValidationRules,
    handleValidationErrors,
    handleVerifyEmail
  );

router
  .route("/forgot-password")
  .post(
    forgotPasswordValidationRules,
    handleValidationErrors,
    handleForgotPassword
  );

router
  .route("/reset-password")
  .post(
    resetPasswordValidationRules,
    handleValidationErrors,
    handleResetPassword
  );

export default router;
