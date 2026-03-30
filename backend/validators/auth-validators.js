// backend/validators/auth-validators.js
import { body } from "express-validator";
import { emailRules, passwordRules } from "./validation-helpers.js";

/*
 * Registration Validation Rules
 */
export const registerValidationRules = [
  body("firstname")
    .notEmpty()
    .withMessage("First name is required").bail()
    .isString()
    .withMessage("First name must be a string").bail()
    .isLength({ min: 3, max: 16 })
    .withMessage("First name must be between 3 and 16 characters long")
    .trim(),

  body("lastname")
    .notEmpty()
    .withMessage("Last name is required").bail()
    .isString()
    .withMessage("Last name must be a string").bail()
    .isLength({ min: 3, max: 16 })
    .withMessage("Last name must be between 3 and 16 characters long")
    .trim(),

  emailRules({ checkDisposable: true }),

  passwordRules("password"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password").bail()
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  body("terms")
    .notEmpty().withMessage("You must accept the terms and conditions.").bail()
    .isBoolean().withMessage("Terms must be a boolean value.").bail()
    .custom((value) => {
      if (value !== true) {
        throw new Error("You must accept the terms and conditions.");
      }
      return true;
    }),
];

/*
 * Login Validation Rules
 */
export const loginValidationRules = [
  emailRules(),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),

  body("rememberMe")
    .optional()
    .isBoolean()
    .withMessage("rememberMe must be a boolean"),
];

export const emailVerificationValidationRules = [
  body("token")
    .notEmpty()
    .withMessage("Verification code is required").bail()
    .custom((value) => {
      const str = String(value).trim();
      if (!/^\d{6}$/.test(str)) {
        throw new Error("Enter your 6-digit verification code");
      }
      return true;
    })
    .customSanitizer((value) => String(value).trim()),
];

export const resendVerificationValidationRules = [
  emailRules(),
];

export const forgotPasswordValidationRules = [
  emailRules(),
];

export const resetPasswordValidationRules = [
  body("token")
    .notEmpty()
    .withMessage("Reset link token is missing").bail()
    .custom((value) => {
      const str = String(value).trim();
      if (!/^[a-f0-9]{64}$/.test(str)) {
        throw new Error("Invalid or corrupted reset token link");
      }
      return true;
    })
    .customSanitizer((value) => String(value).trim()),

  passwordRules("password"),
];

export const verify2faValidationRules = [
  body("token")
    .notEmpty()
    .withMessage("Verification code is required").bail()
    .isString()
    .withMessage("Verification code must be a string").bail()
    .isLength({ min: 6, max: 6 })
    .withMessage("Verification code must be 6 digits").bail()
    .isNumeric()
    .withMessage("Verification code must contain only numbers")
    .customSanitizer((value) => String(value)),

  body("tempToken")
    .notEmpty()
    .withMessage("Temporary token is required").bail()
    .isString()
    .withMessage("Temporary token must be a string"),
];
