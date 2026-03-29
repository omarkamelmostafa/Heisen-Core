import { body } from "express-validator";
import disposableDomains from "disposable-email-domains" with { type: "json" };

/**
 * SECURITY NOTE: Input validation intentionally does NOT use .escape().
 * XSS prevention is handled at the output/rendering layer, not at input.
 * Escaping user input on write corrupts stored data (e.g., O'Brien becomes O&#x27;Brien).
 * All user-provided text is trimmed and length-bounded but never HTML-escaped here.
 */

// Auth Tags Validation Rules



// Common weak passwords list
const commonPasswords = [
  "password", "12345678", "123456789", "qwerty123", "admin123", "welcome1",
  "password1", "1234567890", "abc123", "letmein", "monkey", "shadow", "master",
  "dragon", "passw0rd", "baseball", "football", "qwertyuiop", "1234567",
  "superman", "1qaz2wsx", "password123", "welcome", "login", "admin", "qwerty",
  "sunshine", "princess", "starwars", "iloveyou", "hello123", "welcome123",
  "adminadmin", "pass123", "test123", "changeme", "default", "fantasycoach",
  "fantasy123"
];


const emailRules = ({ checkDisposable = false } = {}) => {
  const chain = body("email")
    .notEmpty()
    .withMessage("Email is required").bail()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 254 })
    .withMessage("Email must be no more than 254 characters long");

  if (checkDisposable) {
    chain.custom((email) => {
      const domain = email.split("@")[1]?.toLowerCase();
      if (domain && disposableDomains.includes(domain)) {
        throw new Error(
          "Disposable email addresses are not allowed. Please use a permanent email address."
        );
      }
      return true;
    });
  }

  return chain;
};

const passwordRules = (field = "password") =>
  body(field)
    .notEmpty().withMessage("Password is required").bail()
    .isString().withMessage("Password must be text").bail()
    .isLength({ min: 8, max: 128 })
    .withMessage("Password must be between 8 and 128 characters")
    .matches(/^(?=.*[a-z])/)
    .withMessage("Must contain at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/)
    .withMessage("Must contain at least one uppercase letter")
    .matches(/^(?=.*\d)/)
    .withMessage("Must contain at least one number")
    .matches(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage("Must contain at least one special character")
    .custom((password) => {
      // Check against common passwords
      if (commonPasswords.includes(password.toLowerCase())) {
        throw new Error("This password is too common and easily guessable. Please choose a stronger password.");
      }
      return true;
    })
    .custom((password) => {
      const str = password.toLowerCase();
      for (let i = 0; i <= str.length - 4; i++) {
        const c1 = str.charCodeAt(i);
        const c2 = str.charCodeAt(i + 1);
        const c3 = str.charCodeAt(i + 2);
        const c4 = str.charCodeAt(i + 3);
        const d1 = c2 - c1;
        const d2 = c3 - c2;
        const d3 = c4 - c3;
        if (
          (d1 === 1 && d2 === 1 && d3 === 1) ||
          (d1 === -1 && d2 === -1 && d3 === -1)
        ) {
          throw new Error(
            "Password contains sequential characters that are easy to guess"
          );
        }
      }
      return true;
    })
    .custom((password) => {
      if (/(.)\1{2,}/.test(password)) {
        throw new Error("Password contains too many repeated characters");
      }
      return true;
    });

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

  passwordRules("password")
    .custom((password, { req }) => {
      const lower = password.toLowerCase();
      const email = (req.body.email || "").toLowerCase();
      const firstname = (req.body.firstname || "").toLowerCase();
      const lastname = (req.body.lastname || "").toLowerCase();
      if (lower.includes(email.split("@")[0]) && email.split("@")[0].length > 2) {
        throw new Error("Password must not contain your email");
      }
      if (firstname.length > 2 && lower.includes(firstname)) {
        throw new Error("Password must not contain your first name");
      }
      if (lastname.length > 2 && lower.includes(lastname)) {
        throw new Error("Password must not contain your last name");
      }
      return true;
    }),

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

