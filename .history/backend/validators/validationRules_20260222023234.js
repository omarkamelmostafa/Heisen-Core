// backend/validators/validationRules.js
// validationRules.js
import { body, check, param, query } from "express-validator";

// Auth Tags Validation Rules

// Disposable email domains list
const disposableDomains = [
  "tempmail.com",
  "throwaway.com",
  "mailinator.com",
  "guerrillamail.com",
  "10minutemail.com",
  "yopmail.com",
  "fakeinbox.com",
  "trashmail.com",
  "sharklasers.com",
  "getairmail.com",
  "temp-mail.org",
  "dispostable.com",
  "maildrop.cc",
  "tempail.com",
  "tmpmail.org",
  "throwawaymail.com",
  "mailnesia.com",
  "mytrashmail.com",
  "jetable.org",
  "mintemail.com",
  "33mail.com",
  "spamgourmet.com",
  "grr.la",
  "mailmetrash.com",
  "deadaddress.com",
  "banit.club",
  "mail-temp.com",
  "tempinbox.com",
  "fake-mail.com",
  "tempmailo.com",
  "owleyes.ch",
  "tempomail.fr",
  "temporarymail.net",
  "emailondeck.com",
  "temp-mail.ru",
  "mail-temporaire.com",
];

// Common weak passwords list
const commonPasswords = [
  "password",
  "12345678",
  "123456789",
  "qwerty123",
  "admin123",
  "welcome1",
  "password1",
  "1234567890",
  "abc123",
  "letmein",
  "monkey",
  "shadow",
  "master",
  "dragon",
  "passw0rd",
  "baseball",
  "football",
  "qwertyuiop",
  "1234567",
  "superman",
  "1qaz2wsx",
  "password123",
  "welcome",
  "login",
  "admin",
  "qwerty",
  "sunshine",
  "princess",
  "starwars",
  "iloveyou",
  "hello123",
  "welcome123",
  "adminadmin",
  "pass123",
  "test123",
  "changeme",
  "default",
];

// Registration Validation Rules
export const registerValidationRules = [
  check("firstname")
    .isString()
    .withMessage("First name must be a string")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 3, max: 16 })
    .withMessage("First name must be between 3 and 16 characters long")
    .trim()
    .escape(),

  check("lastname")
    .isString()
    .withMessage("Last name must be a string")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 3, max: 16 })
    .withMessage("Last name must be between 3 and 16 characters long")
    .trim()
    .escape(),

  check("email")
    .isEmail()
    .withMessage("Email must be a valid email address")
    .notEmpty()
    .withMessage("Email is required")
    .normalizeEmail()
    .custom((email) => {
      // Check for disposable email domains
      const domain = email.split("@")[1].toLowerCase();
      if (disposableDomains.includes(domain)) {
        throw new Error(
          "Disposable email addresses are not allowed. Please use a permanent email address."
        );
      }
      return true;
    }),

  check("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters long")
    .matches(/^(?=.*[a-z])/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/^(?=.*[0-9])/)
    .withMessage("Password must contain at least one number")
    .matches(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage("Password must contain at least one special character")
    .custom((password, { req }) => {
      if (password !== req.body.confirmPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
  // .custom((password) => {
  //   // Check against common passwords
  //   if (commonPasswords.includes(password.toLowerCase())) {
  //     throw new Error(
  //       "This password is too common and easily guessable. Please choose a stronger password."
  //     );
  //   }
  //   return true;
  // })
  // .custom((password) => {
  //   // Check for sequential characters
  //   const sequentialRegex =
  //     /(abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i;
  //   if (sequentialRegex.test(password)) {
  //     throw new Error(
  //       "Password contains sequential characters that are easy to guess"
  //     );
  //   }
  //   return true;
  // })
  // .custom((password) => {
  //   // Check for repeated characters
  //   const repeatedRegex = /(.)\1{2,}/;
  //   if (repeatedRegex.test(password)) {
  //     throw new Error("Password contains too many repeated characters");
  //   }
  //   return true;
  // })

  check("confirmPassword")
    .isString()
    .withMessage("Confirm password must be a string")
    .notEmpty()
    .withMessage("Confirm password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Confirm password must be between 8 and 20 characters long"),
];

// Login Validation Rules
export const loginValidationRules = [
  check("email")
    .isEmail()
    .withMessage("Email must be a valid email address")
    .notEmpty()
    .withMessage("Email is required")
    .normalizeEmail(),

  check("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters long")
    .matches(/^(?=.*[a-z])/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/^(?=.*[0-9])/)
    .withMessage("Password must contain at least one number")
    .matches(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage("Password must contain at least one special character"),
];

export const emailVerificationValidationRules = [
  check("code")
    .isString()
    .withMessage("Verification code must be a string")
    .notEmpty()
    .withMessage("Verification code is required")
    .isLength({ min: 4, max: 100 })
    .withMessage("Verification code must be between 10 and 100 characters long")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Verification code can only contain letters, numbers, hyphens, and underscores"
    )
    .trim()
    .escape(),
];

export const forgotPasswordValidationRules = [
  check("email")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ max: 100 })
    .withMessage("Email must be no more than 100 characters long")
    .normalizeEmail()
    .trim(),
];

export const resetPasswordValidationRules = [
  // ✅ Validate URL parameter (token)
  param("token")
    .isString()
    .withMessage("Reset token must be a string")
    .notEmpty()
    .withMessage("Reset token is required")
    .isLength({ min: 20, max: 100 })
    .withMessage("Reset token must be between 20 and 100 characters long")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Reset token can only contain letters, numbers, hyphens, and underscores"
    )
    .trim(),

  // ✅ Validate request body (password)
  body("password")
    .isString()
    .withMessage("Password must be a string")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters long")
    .matches(/^(?=.*[a-z])/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/^(?=.*[A-Z])/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/^(?=.*[0-9])/)
    .withMessage("Password must contain at least one number")
    .matches(/^(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage("Password must contain at least one special character"),
];

// Users Tags Validation Rules
export const updateProfileValidationRules = [
  check("firstname")
    .isString()
    .withMessage("First name must be a string")
    .notEmpty()
    .withMessage("First name is required")
    .isLength({ min: 3, max: 16 })
    .withMessage("First name must be between 3 and 16 characters long"),
  check("lastname")
    .isString()
    .withMessage("Last name must be a string")
    .notEmpty()
    .withMessage("Last name is required")
    .isLength({ min: 3, max: 16 })
    .withMessage("Last name must be between 3 and 16 characters long"),
  check("email")
    .isEmail()
    .withMessage("Email must be a valid email address")
    .notEmpty()
    .withMessage("Email is required")
    .isLength({ min: 6, max: 100 })
    .withMessage("Email must be between 6 and 100 characters long"),
];

export const updatePasswordValidationRules = [
  check("oldPassword")
    .isString()
    .withMessage("Old password must be a string")
    .notEmpty()
    .withMessage("Old password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Old password must be between 8 and 20 characters long")
    .matches(/[a-z]/)
    .withMessage("Old password must contain at least one lowercase char")
    .matches(/[A-Z]/)
    .withMessage("Old password must contain at least one uppercase char")
    .matches(/[0-9@!#\$%\^\&*\)\(+=._-]+/)
    .withMessage(
      "Old password must contain at least one number or special character (@,!,#, etc)."
    ),
  check("newPassword")
    .isString()
    .withMessage("New password must be a string")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("New password must be between 8 and 20 characters long")
    .matches(/[a-z]/)
    .withMessage("New password must contain at least one lowercase char")
    .matches(/[A-Z]/)
    .withMessage("New password must contain at least one uppercase char")
    .matches(/[0-9@!#\$%\^\&*\)\(+=._-]+/)
    .withMessage(
      "New password must contain at least one number or special character (@,!,#, etc)."
    ),
  check("confirmPassword")
    .isString()
    .withMessage("Confirm password must be a string")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("New Passwords must match");
      }
      return true;
    }),
];

export const addAlbumValidationRules = [
  check("albumTitle")
    .isString()
    .withMessage("Album title must be a string")
    .notEmpty()
    .withMessage("Album title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Album title must be between 5 and 200 characters long"),
  check("albumDescription")
    .isString()
    .withMessage("Album description must be a string")
    .notEmpty()
    .withMessage("Album description is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Album description must be between 5 and 500 characters long"),
];

export const editAlbumValidationRules = [
  check("albumId")
    .notEmpty()
    .withMessage("Album ID is required")
    .isMongoId()
    .withMessage("Invalid Album ID format")
    .isLength({ min: 24, max: 24 })
    .withMessage("Album ID must be 24 characters long"),
  check("albumTitle")
    .isString()
    .withMessage("Album title must be a string")
    .notEmpty()
    .withMessage("Album title is required")
    .isLength({ min: 5, max: 200 })
    .withMessage("Album title must be between 5 and 200 characters long"),
  check("albumDescription")
    .isString()
    .withMessage("Album description must be a string")
    .notEmpty()
    .withMessage("Album description is required")
    .isLength({ min: 5, max: 500 })
    .withMessage("Album description must be between 5 and 500 characters long"),
];

export const deleteAlbumValidationRules = [
  check("albumId")
    .notEmpty()
    .withMessage("Album ID is required")
    .isMongoId()
    .withMessage("Invalid Album ID format")
    .isLength({ min: 24, max: 24 })
    .withMessage("Album ID must be 24 characters long"),
];

export const downloadPhotoValidationRules = [
  check("photoId")
    .notEmpty()
    .withMessage("Photo ID is required")
    .isMongoId()
    .withMessage("Invalid Photo ID format")
    .isLength({ min: 24, max: 24 })
    .withMessage("Photo ID must be 24 characters long"),
];

export const deletePhotoValidationRules = [
  check("albumId")
    .notEmpty()
    .withMessage("Album ID is required")
    .isMongoId()
    .withMessage("Invalid Album ID format")
    .isLength({ min: 24, max: 24 })
    .withMessage("Album ID must be 24 characters long"),
  check("photoId")
    .notEmpty()
    .withMessage("Photo ID is required")
    .isMongoId()
    .withMessage("Invalid Photo ID format")
    .isLength({ min: 24, max: 24 })
    .withMessage("Photo ID must be 24 characters long"),
];

export const loadMorePhotosValidationRules = [
  param("albumId")
    .notEmpty()
    .withMessage("Album ID is required")
    .isMongoId() // Assuming albumId is a MongoDB ObjectId; use .isUUID() if it's a UUID
    .withMessage("Album ID must be a valid identifier"),

  query("page")
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer")
    .optional(),

  query("limit")
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be a positive integer between 1 and 100")
    .optional(),
];

// Roles and Permissions Tags Validation Rules
export const addRoleValidationRules = [
  check("name")
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters long"),

  check("description")
    .isString()
    .withMessage("Description must be a string")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Description must be between 3 and 200 characters long"),

  check("permissions")
    .isArray({ min: 1 })
    .withMessage("Permissions must be an array with at least one permission")
    .notEmpty()
    .withMessage("Permissions are required"),
];

// Permissions Validation Rules
export const addPermissionValidationRules = [
  check("name")
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters long"),

  check("key")
    .isString()
    .withMessage("Key must be a string")
    .notEmpty()
    .withMessage("Key is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Key must be between 3 and 50 characters long"),

  check("description")
    .isString()
    .withMessage("Description must be a string")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Description must be between 3 and 200 characters long"),
];

export const editPermissionValidationRules = [
  check("name")
    .isString()
    .withMessage("Name must be a string")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Name must be between 3 and 50 characters long"),

  check("description")
    .isString()
    .withMessage("Description must be a string")
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ min: 3, max: 200 })
    .withMessage("Description must be between 3 and 200 characters long"),
];

// Favorites Validation Rules
export const addFavoriteValidationRules = [
  check("teamId")
    .isMongoId()
    .withMessage("Team ID must be a valid MongoDB ID")
    .notEmpty()
    .withMessage("Team ID is required"),
  check("teamUuid")
    .isUUID()
    .withMessage("Team UUID must be a valid UUID")
    .notEmpty()
    .withMessage("Team UUID is required"),
];

export const removeFavoriteValidationRules = [
  check("teamId")
    .isMongoId()
    .withMessage("Team ID must be a valid MongoDB ID")
    .notEmpty()
    .withMessage("Team ID is required"),
  check("teamUuid")
    .isUUID()
    .withMessage("Team UUID must be a valid UUID")
    .notEmpty()
    .withMessage("Team UUID is required"),
];

// Leagues Validation Rules

export const fetchLeaguesValidationRules = [
  query("page")
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  query("limit")
    .isInt({ min: 1 })
    .withMessage("Limit must be a positive integer"),
];

export const addLeagueValidationRules = [
  check("leagueName")
    .isString()
    .withMessage("League name must be a string")
    .notEmpty()
    .withMessage("League name is required")
    .isLength({ min: 3, max: 100 })
    .withMessage("League name must be between 3 and 100 characters long"),

  check("url")
    .isURL()
    .withMessage("URL must be a valid URL")
    .notEmpty()
    .withMessage("URL is required")
    .isLength({ min: 3, max: 500 })
    .withMessage("URL must be between 3 and 500 characters long"),

  check("country")
    .isString()
    .withMessage("Country must be a string")
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Country must be between 3 and 50 characters long"),

  check("sport")
    .isString()
    .withMessage("Sport must be a string")
    .notEmpty()
    .withMessage("Sport is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Sport must be between 3 and 50 characters long"),

  check("numberOfTeams")
    .isInt({ min: 10, max: 72 })
    .withMessage("Number of teams must be between 10 and 72")
    .notEmpty()
    .withMessage("Number of teams is required"),

  check("seasonFrom")
    .isString()
    .withMessage("Season from must be a string")
    .notEmpty()
    .withMessage("Season from is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Season from must be between 3 and 50 characters long"),

  check("seasonTo")
    .isString()
    .withMessage("Season to must be a string")
    .notEmpty()
    .withMessage("Season to is required")
    .isLength({ min: 3, max: 50 })
    .withMessage("Season to must be between 3 and 50 characters long"),

  check("matchesFixture")
    .isURL()
    .withMessage("Matches fixture must be a valid URL")
    .notEmpty()
    .withMessage("Matches fixture is required")
    .isLength({ min: 3, max: 500 })
    .withMessage("Matches fixture must be between 3 and 500 characters long"),

  // Custom validation to ensure `seasonFrom` and `seasonTo` are not the same
  body("seasonTo").custom((value, { req }) => {
    if (value === req.body.seasonFrom) {
      throw new Error("Season from and season to cannot be the same");
    }
    return true;
  }),
];

export const updateLeagueValidationRules = [
  ...addLeagueValidationRules,

  check("id")
    .notEmpty()
    .withMessage("ID is required")
    .isMongoId()
    .withMessage("ID must be a valid MongoDB ID format"),

  check("uuid")
    .notEmpty()
    .withMessage("UUID is required")
    .isUUID()
    .withMessage("UUID must be a valid UUID format"),
];

export const deleteLeagueValidationRules = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isMongoId() // Assuming ID is a MongoDB ObjectId; use .isUUID() if it's a UUID
    .withMessage("ID must be a valid identifier"),
];

export const fetchLeagueValidationRules = [
  check("leagueUuid")
    .isUUID()
    .withMessage("League UUID must be a valid UUID")
    .notEmpty()
    .withMessage("League UUID is required"),
];

// Matches Validation Rules
export const deleteMatchValidationRules = [
  param("matchUuid")
    .isUUID()
    .withMessage("Match UUID must be a valid UUID")
    .notEmpty()
    .withMessage("Match UUID is required"),
];

export const fetchTeamValidationRules = [
  check("teamUuid")
    .isUUID()
    .withMessage("Team UUID must be a valid UUID")
    .notEmpty()
    .withMessage("Team UUID is required"),
];

// export const addTeamFavorite = [
//   check("teamId")
//     .isMongoId()
//     .withMessage("Team ID must be a valid MongoDB ID")
//     .notEmpty()
//     .withMessage("Team ID is required"),
//   check("teamUuid")
//     .isUUID()
//     .withMessage("Team UUID must be a valid UUID")
//     .notEmpty()
//     .withMessage("Team UUID is required"),
// ];
// Add more validation rules here as needed
