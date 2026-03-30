// frontend/src/lib/validations/auth-schemas.js
import { z } from "zod";

// Password rules constant for reuse across schemas
const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 128,
};

// Shared email validation with proper required and email validation
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

// Shared password validation
const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character"
  );

// Login password validation (only length requirement)
const loginPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters");

// Name validation schema
const nameSchema = z
  .string()
  .min(1, "This field is required")
  .min(3, "Must be at least 3 characters")
  .max(16, "Must be at most 16 characters")
  .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces");

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
  rememberMe: z.boolean().optional().default(false),
});

// Signup Schema
export const signupSchema = z
  .object({
    firstname: nameSchema,
    lastname: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  userEmail: emailSchema,
});

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Verify Email Schema
export const verifyEmailSchema = z.object({
  verificationCode: z
    .array(z.string().min(1, "Digit is required"))
    .length(6, "Verification code must be 6 digits"),
});

// Profile Update Schema
export const updateProfileSchema = z.object({
  firstname: nameSchema,
  lastname: nameSchema,
});

export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .min(1, "New email is required")
    .email("Please enter a valid email address")
    .max(254, "Email must be at most 254 characters"),
  confirmNewEmail: z
    .string()
    .min(1, "Please confirm your new email"),
  currentPassword: z
    .string()
    .min(1, "Current password is required"),
}).refine((data) => data.newEmail === data.confirmNewEmail, {
  message: "Emails do not match",
  path: ["confirmNewEmail"],
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword !== data.oldPassword, {
  message: "New password must be different from your current password",
  path: ["newPassword"],
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ============================================
// i18n Schema Factories
// These accept a translator function t() from useTranslations("validation")
// and return schemas with translated validation messages.
// ============================================

function createEmailSchema(t) {
  return z.string().min(1, t("email.required")).email(t("email.invalid"));
}

function createPasswordSchema(t) {
  return z
    .string()
    .min(1, t("password.required"))
    .min(PASSWORD_RULES.minLength, t("password.minLength"))
    .max(PASSWORD_RULES.maxLength, t("password.maxLength"))
    .regex(/[A-Z]/, t("password.uppercase"))
    .regex(/[a-z]/, t("password.lowercase"))
    .regex(/[0-9]/, t("password.number"))
    .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, t("password.special"));
}

function createLoginPasswordSchema(t) {
  return z
    .string()
    .min(1, t("password.required"))
    .min(PASSWORD_RULES.minLength, t("password.minLength"));
}

function createNameSchema(t) {
  return z
    .string()
    .min(1, t("name.required"))
    .min(3, t("name.minLength"))
    .max(16, t("name.maxLength"))
    .regex(/^[a-zA-Z\s]+$/, t("name.lettersOnly"));
}

export function createLoginSchema(t) {
  return z.object({
    email: createEmailSchema(t),
    password: createLoginPasswordSchema(t),
    rememberMe: z.boolean().optional(),
  });
}

export function createSignupSchema(t) {
  return z
    .object({
      firstname: createNameSchema(t),
      lastname: createNameSchema(t),
      email: createEmailSchema(t),
      password: createPasswordSchema(t),
      confirmPassword: z.string().min(1, t("confirmPassword.required")),
      terms: z.boolean(),
    })
    .refine((data) => data.terms === true, {
      message: t("terms.required"),
      path: ["terms"],
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("confirmPassword.match"),
      path: ["confirmPassword"],
    });
}

export function createForgotPasswordSchema(t) {
  return z.object({
    userEmail: createEmailSchema(t),
  });
}

export function createResetPasswordSchema(t) {
  return z
    .object({
      password: createPasswordSchema(t),
      confirmPassword: z.string().min(1, t("confirmPassword.required")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("confirmPassword.match"),
      path: ["confirmPassword"],
    });
}

export function createVerifyEmailSchema(t) {
  return z.object({
    verificationCode: z
      .array(z.string().min(1, t("verificationCode.digitRequired")))
      .length(6, t("verificationCode.length")),
  });
}

export function createUpdateProfileSchema(t) {
  return z.object({
    firstname: createNameSchema(t),
    lastname: createNameSchema(t),
  });
}

export function createChangeEmailSchema(t) {
  return z
    .object({
      newEmail: z
        .string()
        .min(1, t("newEmail.required"))
        .email(t("newEmail.invalid"))
        .max(254, t("newEmail.maxLength")),
      confirmNewEmail: z
        .string()
        .min(1, t("confirmNewEmail.required")),
      currentPassword: z
        .string()
        .min(1, t("currentPassword.required")),
    })
    .refine((data) => data.newEmail === data.confirmNewEmail, {
      message: t("confirmNewEmail.match"),
      path: ["confirmNewEmail"],
    });
}

export function createChangePasswordSchema(t) {
  return z
    .object({
      oldPassword: z.string().min(1, t("currentPassword.required")),
      newPassword: createPasswordSchema(t),
      confirmPassword: z.string().min(1, t("newPassword.confirmRequired")),
    })
    .refine((data) => data.oldPassword !== data.newPassword, {
      message: t("newPassword.different"),
      path: ["newPassword"],
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("newPassword.match"),
      path: ["confirmPassword"],
    });
}
