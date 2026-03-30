import { body, param, query } from "express-validator";
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
  body("firstName")
    .notEmpty()
    .withMessage("First name is required").bail()
    .isString()
    .withMessage("First name must be a string").bail()
    .isLength({ min: 3, max: 16 })
    .withMessage("First name must be between 3 and 16 characters long")
    .trim(),

  body("lastName")
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
      const firstName = (req.body.firstName || "").toLowerCase();
      const lastName = (req.body.lastName || "").toLowerCase();
      if (lower.includes(email.split("@")[0]) && email.split("@")[0].length > 2) {
        throw new Error("Password must not contain your email");
      }
      if (firstName.length > 2 && lower.includes(firstName)) {
        throw new Error("Password must not contain your first name");
      }
      if (lastName.length > 2 && lower.includes(lastName)) {
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
];

/* 
 * Login Validation Rules 
 */
export const loginValidationRules = [
  emailRules(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
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

export const forgotPasswordValidationRules = [
  emailRules(),
  emailRules({ checkDisposable: true }),
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

  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password").bail()
    .custom((confirmPassword, { req }) => {
      if (confirmPassword !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    })
];

/* 
 * Users Tags Validation Rules 
 */
export const updateProfileValidationRules = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required").bail()
    .isString()
    .withMessage("First name must be a string").bail()
    .isLength({ min: 3, max: 16 })
    .withMessage("First name must be between 3 and 16 characters long")
    .trim(),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required").bail()
    .isString()
    .withMessage("Last name must be a string").bail()
    .isLength({ min: 3, max: 16 })
    .withMessage("Last name must be between 3 and 16 characters long")
    .trim(),

  emailRules({ checkDisposable: true }),
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

/* 
 * Album rules
 */
export const addAlbumValidationRules = [
  body("albumTitle")
    .notEmpty()
    .withMessage("Album title is required").bail()
    .isString()
    .withMessage("Album title must be a string").bail()
    .isLength({ min: 5, max: 200 })
    .withMessage("Album title must be between 5 and 200 characters long")
    .trim(),
  body("albumDescription")
    .notEmpty()
    .withMessage("Album description is required").bail()
    .isString()
    .withMessage("Album description must be a string").bail()
    .isLength({ min: 5, max: 500 })
    .withMessage("Album description must be between 5 and 500 characters long")
    .trim(),
];

export const editAlbumValidationRules = [
  body("albumId")
    .notEmpty()
    .withMessage("Album ID is required").bail()
    .isMongoId()
    .withMessage("Invalid Album ID format"),
  body("albumTitle")
    .notEmpty()
    .withMessage("Album title is required").bail()
    .isString()
    .withMessage("Album title must be a string").bail()
    .isLength({ min: 5, max: 200 })
    .withMessage("Album title must be between 5 and 200 characters long")
    .trim(),
  body("albumDescription")
    .notEmpty()
    .withMessage("Album description is required").bail()
    .isString()
    .withMessage("Album description must be a string").bail()
    .isLength({ min: 5, max: 500 })
    .withMessage("Album description must be between 5 and 500 characters long")
    .trim(),
];

export const deleteAlbumValidationRules = [
  param("albumId")
    .notEmpty()
    .withMessage("Album ID is required").bail()
    .isMongoId()
    .withMessage("Invalid Album ID format"),
];

export const downloadPhotoValidationRules = [
  param("photoId")
    .notEmpty()
    .withMessage("Photo ID is required").bail()
    .isMongoId()
    .withMessage("Invalid Photo ID format"),
];

export const deletePhotoValidationRules = [
  param("albumId")
    .notEmpty()
    .withMessage("Album ID is required").bail()
    .isMongoId()
    .withMessage("Invalid Album ID format"),
  param("photoId")
    .notEmpty()
    .withMessage("Photo ID is required").bail()
    .isMongoId()
    .withMessage("Invalid Photo ID format"),
];

export const loadMorePhotosValidationRules = [
  param("albumId")
    .notEmpty()
    .withMessage("Album ID is required").bail()
    .isMongoId()
    .withMessage("Album ID must be a valid identifier"),
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be a positive integer between 1 and 100"),
];

// Roles and Permissions Tags Validation Rules
export const addRoleValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Name is required").bail()
    .isString()
    .withMessage("Name must be a string").bail()
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters long")
    .trim(),
  body("description")
    .notEmpty()
    .withMessage("Description is required").bail()
    .isString()
    .withMessage("Description must be a string").bail()
    .isLength({ min: 3, max: 200 })
    .withMessage("Description must be between 3 and 200 characters long")
    .trim(),
  body("permissions")
    .notEmpty()
    .withMessage("Permissions are required").bail()
    .isArray({ min: 1 })
    .withMessage("Permissions must be an array with at least one permission"),
];

// Permissions Validation Rules
export const addPermissionValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Name is required").bail()
    .isString()
    .withMessage("Name must be a string").bail()
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters long")
    .trim(),
  body("key")
    .notEmpty()
    .withMessage("Key is required").bail()
    .isString()
    .withMessage("Key must be a string").bail()
    .isLength({ min: 3, max: 50 })
    .withMessage("Key must be between 3 and 50 characters long")
    .trim(),
  body("description")
    .notEmpty()
    .withMessage("Description is required").bail()
    .isString()
    .withMessage("Description must be a string").bail()
    .isLength({ min: 3, max: 200 })
    .withMessage("Description must be between 3 and 200 characters long")
    .trim(),
];

export const editPermissionValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Name is required").bail()
    .isString()
    .withMessage("Name must be a string").bail()
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters long")
    .trim(),
  body("description")
    .notEmpty()
    .withMessage("Description is required").bail()
    .isString()
    .withMessage("Description must be a string").bail()
    .isLength({ min: 3, max: 200 })
    .withMessage("Description must be between 3 and 200 characters long")
    .trim(),
];

// Favorites Validation Rules
export const addFavoriteValidationRules = [
  body("teamId")
    .notEmpty()
    .withMessage("Team ID is required").bail()
    .isMongoId()
    .withMessage("Team ID must be a valid MongoDB ID"),
  body("teamUuid")
    .notEmpty()
    .withMessage("Team UUID is required").bail()
    .isUUID()
    .withMessage("Team UUID must be a valid UUID"),
];

export const removeFavoriteValidationRules = [
  body("teamId")
    .notEmpty()
    .withMessage("Team ID is required").bail()
    .isMongoId()
    .withMessage("Team ID must be a valid MongoDB ID"),
  body("teamUuid")
    .notEmpty()
    .withMessage("Team UUID is required").bail()
    .isUUID()
    .withMessage("Team UUID must be a valid UUID"),
];

// Leagues Validation Rules
export const fetchLeaguesValidationRules = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

export const addLeagueValidationRules = [
  body("leagueName")
    .notEmpty()
    .withMessage("League name is required").bail()
    .isString()
    .withMessage("League name must be a string").bail()
    .isLength({ min: 3, max: 100 })
    .withMessage("League name must be between 3 and 100 characters long")
    .trim(),
  body("url")
    .notEmpty()
    .withMessage("URL is required").bail()
    .isURL()
    .withMessage("URL must be a valid URL")
    .isLength({ min: 3, max: 500 })
    .withMessage("URL must be between 3 and 500 characters long")
    .trim(),
  body("country")
    .notEmpty()
    .withMessage("Country is required").bail()
    .isString()
    .withMessage("Country must be a string").bail()
    .isLength({ min: 3, max: 50 })
    .withMessage("Country must be between 3 and 50 characters long")
    .trim(),
  body("sport")
    .notEmpty()
    .withMessage("Sport is required").bail()
    .isString()
    .withMessage("Sport must be a string").bail()
    .isLength({ min: 3, max: 50 })
    .withMessage("Sport must be between 3 and 50 characters long")
    .trim(),
  body("numberOfTeams")
    .notEmpty()
    .withMessage("Number of teams is required").bail()
    .isInt({ min: 10, max: 72 })
    .withMessage("Number of teams must be between 10 and 72"),
  body("seasonFrom")
    .notEmpty()
    .withMessage("Season from is required").bail()
    .isString()
    .withMessage("Season from must be a string").bail()
    .isLength({ min: 3, max: 50 })
    .withMessage("Season from must be between 3 and 50 characters long")
    .trim(),
  body("seasonTo")
    .notEmpty()
    .withMessage("Season to is required").bail()
    .isString()
    .withMessage("Season to must be a string").bail()
    .isLength({ min: 3, max: 50 })
    .withMessage("Season to must be between 3 and 50 characters long")
    .trim()
    .custom((value, { req }) => {
      if (value === req.body.seasonFrom) throw new Error("Season from and season to cannot be the same");
      return true;
    }),
  body("matchesFixture")
    .notEmpty()
    .withMessage("Matches fixture is required").bail()
    .isURL()
    .withMessage("Matches fixture must be a valid URL")
    .isLength({ min: 3, max: 500 })
    .withMessage("Matches fixture must be between 3 and 500 characters long")
    .trim(),
];

export const updateLeagueValidationRules = [
  ...addLeagueValidationRules,
  body("id")
    .notEmpty()
    .withMessage("ID is required").bail()
    .isMongoId()
    .withMessage("ID must be a valid MongoDB ID format"),
  body("uuid")
    .notEmpty()
    .withMessage("UUID is required").bail()
    .isUUID()
    .withMessage("UUID must be a valid UUID format"),
];

export const deleteLeagueValidationRules = [
  param("id")
    .notEmpty()
    .withMessage("ID is required").bail()
    .isMongoId()
    .withMessage("ID must be a valid identifier"),
];

export const fetchLeagueValidationRules = [
  param("leagueUuid")
    .notEmpty()
    .withMessage("League UUID is required").bail()
    .isUUID()
    .withMessage("League UUID must be a valid UUID"),
];

// Matches Validation Rules
export const deleteMatchValidationRules = [
  param("matchUuid")
    .notEmpty()
    .withMessage("Match UUID is required").bail()
    .isUUID()
    .withMessage("Match UUID must be a valid UUID"),
];

export const fetchTeamValidationRules = [
  param("teamUuid")
    .notEmpty()
    .withMessage("Team UUID is required").bail()
    .isUUID()
    .withMessage("Team UUID must be a valid UUID"),
];
