// backend/validators/validation-helpers.js
import { body } from "express-validator";
import disposableDomains from "disposable-email-domains" with { type: "json" };
import { zxcvbn, zxcvbnOptions } from "@zxcvbn-ts/core";
import * as zxcvbnCommonPackage from "@zxcvbn-ts/language-common";
import * as zxcvbnEnPackage from "@zxcvbn-ts/language-en";

/**
 * SECURITY NOTE: Input validation intentionally does NOT use .escape().
 * XSS prevention is handled at the output/rendering layer, not at input.
 * Escaping user input on write corrupts stored data (e.g., O'Brien becomes O&#x27;Brien).
 * All user-provided text is trimmed and length-bounded but never HTML-escaped here.
 */

// Initialize zxcvbn with common + English dictionaries
const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};
zxcvbnOptions.setOptions(options);

/**
 * Minimum zxcvbn score required for password acceptance.
 * 0 = too guessable, 1 = very guessable, 2 = somewhat guessable,
 * 3 = safely unguessable, 4 = very unguessable
 */
const MINIMUM_PASSWORD_SCORE = 3;

export const emailRules = ({ checkDisposable = false } = {}) => {
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

export const passwordRules = (field = "password") =>
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
    .custom((password, { req }) => {
      // Build user inputs array for context-aware checking
      const userInputs = [];
      if (req.body.email) {
        const emailLocal = req.body.email.split("@")[0];
        if (emailLocal.length > 2) userInputs.push(emailLocal);
      }
      if (req.body.firstname && req.body.firstname.length > 2) {
        userInputs.push(req.body.firstname);
      }
      if (req.body.lastname && req.body.lastname.length > 2) {
        userInputs.push(req.body.lastname);
      }

      const result = zxcvbn(password, userInputs);

      if (result.score < MINIMUM_PASSWORD_SCORE) {
        // Provide actionable feedback from zxcvbn
        const feedback = result.feedback.warning || result.feedback.suggestions[0];
        if (feedback) {
          throw new Error(feedback);
        }
        throw new Error("Password is too weak. Try a longer password with more variety.");
      }

      return true;
    });
