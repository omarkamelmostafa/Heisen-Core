// backend/validators/user-validators.js
import { body } from "express-validator";
import { passwordRules } from "./validation-helpers.js";

/*
 * Users Tags Validation Rules
 */
export const updateProfileValidationRules = [
  body("firstname")
    .notEmpty()
    .withMessage("First name is required")
    .bail()
    .isString()
    .withMessage("First name must be a string")
    .bail()
    .isLength({ min: 3, max: 16 })
    .withMessage("First name must be between 3 and 16 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("First name can only contain letters and spaces")
    .trim(),

  body("lastname")
    .notEmpty()
    .withMessage("Last name is required")
    .bail()
    .isString()
    .withMessage("Last name must be a string")
    .bail()
    .isLength({ min: 3, max: 16 })
    .withMessage("Last name must be between 3 and 16 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Last name can only contain letters and spaces")
    .trim(),
];

export const updatePasswordValidationRules = [
  body("oldPassword")
    .notEmpty()
    .withMessage("Old password is required").bail()
    .isString()
    .withMessage("Old password must be a string").bail()
    .isLength({ max: 128 })
    .withMessage("Old password length exceeded limit"),

  passwordRules("newPassword"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required").bail()
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("New passwords must match");
      }
      return true;
    }),
];

export const toggle2faValidationRules = [
  body("enable")
    .notEmpty()
    .withMessage("Enable flag is required").bail()
    .isBoolean()
    .withMessage("Enable must be a boolean"),

  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required").bail()
    .isString()
    .withMessage("Current password must be a string").bail()
    .isLength({ max: 128 })
    .withMessage("Password length exceeded limit"),
];

export const emailChangeValidationRules = [
  body("newEmail")
    .notEmpty()
    .withMessage("New email is required.")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .bail()
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage("Email must be at most 254 characters."),
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required.")
    .bail()
    .isString()
    .withMessage("Password must be a string.")
    .bail(),
];
