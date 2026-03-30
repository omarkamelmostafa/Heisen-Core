import express from "express";
import {
  handleForgotPassword,
  handleLogin,
  handleLogout,
  handleRefreshToken,
  handleRegister,
  handleResetPassword,
  handleVerifyEmail,
} from "../../controllers/auth/auth-controller.js";
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

// import {
// 	login,
// 	logout,
// 	signup,
// 	verifyEmail,
// 	forgotPassword,
// 	resetPassword,
// 	checkAuth,
// } from "../controllers/auth.controller.js";
// import { verifyToken } from "../middleware/verifyToken.js";

// const router = express.Router();

// router.get("/check-auth", verifyToken, checkAuth);

// router.post("/signup", signup);
// router.post("/login", login);
// router.post("/logout", logout);

// router.post("/verify-email", verifyEmail);
// router.post("/forgot-password", forgotPassword);

// router.post("/reset-password/:token", resetPassword);

// export default router;
