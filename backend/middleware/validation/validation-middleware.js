import { check, validationResult } from "express-validator";
import { apiResponseManager } from "../../utilities/general/response-manager.js";

export const validateFields = (fields) => {
  const validations = [];

  fields.forEach((field) => {
    if (field.allowed) {
      validations.push(
        check(field.name).exists().withMessage(`${field.name} is required`)
      );
    }
    if (field.notEmpty) {
      validations.push(
        check(field.name)
          .notEmpty()
          .withMessage(`${field.name} cannot be empty`)
      );
    }
    if (field.minLength) {
      validations.push(
        check(field.name)
          .isLength({ min: field.minLength })
          .withMessage(
            `${field.name} must be at least ${field.minLength} characters`
          )
      );
    }
    if (field.maxLength) {
      validations.push(
        check(field.name)
          .isLength({ max: field.maxLength })
          .withMessage(
            `${field.name} cannot exceed ${field.maxLength} characters`
          )
      );
    }
    if (field.dataType) {
      if (field.dataType === "email") {
        validations.push(
          check(field.name)
            .isEmail()
            .withMessage(`${field.name} must be a valid email`)
        );
      } else if (field.dataType === "uuid") {
        validations.push(
          check(field.name)
            .isUUID()
            .withMessage(`${field.name} must be a valid UUID`)
        );
      } else if (field.dataType === "number") {
        validations.push(
          check(field.name)
            .isNumeric()
            .withMessage(`${field.name} must be a valid number`)
        );
        if (field.minValue) {
          validations.push(
            check(field.name)
              .isFloat({ min: field.minValue })
              .withMessage(`${field.name} must be at least ${field.minValue}`)
          );
        }
        if (field.maxValue) {
          validations.push(
            check(field.name)
              .isFloat({ max: field.maxValue })
              .withMessage(
                `${field.name} must be no more than ${field.maxValue}`
              )
          );
        }
      } else if (field.dataType === "string") {
        validations.push(
          check(field.name)
            .isString()
            .withMessage(`${field.name} must be a string`)
        );
      } else if (field.dataType === "url") {
        validations.push(
          check(field.name)
            .isURL()
            .withMessage(`${field.name} must be a valid URL`)
        );
      }
    }
    if (field.isArray) {
      validations.push(
        check(field.name)
          .isArray()
          .withMessage(`${field.name} must be an array`)
      );
      if (field.minLength) {
        validations.push(
          check(field.name)
            .isLength({ min: field.minLength })
            .withMessage(
              `${field.name} must contain at least ${field.minLength} item(s)`
            )
        );
      }
    }
  });

  return validations;
};

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Extract first error for cleaner message
    const firstError = errors.array()[0];
    return apiResponseManager(req, res, {
      statusCode: 400,
      success: false,
      // message: "Validation failed",
      message: `Validation failed: ${firstError.msg}`,
      errorCode: "BadRequest",
      errorDetails: errors.array(),
    });
  }
  next();
};

// Example usage: validateFields
// const updateProfileValidationRules = validateFields([
//   {
//     name: "firstname",
//     notEmpty: true,
//     minLength: 3,
//     maxLength: 16,
//     dataType: "string",
//   },
//   {
//     name: "lastname",
//     notEmpty: true,
//     minLength: 3,
//     maxLength: 16,
//     dataType: "string",
//   },
//   {
//     name: "email",
//     notEmpty: true,
//     minLength: 6,
//     maxLength: 100,
//     dataType: "email",
//   },
// ]);
