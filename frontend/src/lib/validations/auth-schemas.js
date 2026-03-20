// frontend/src/lib/validations/auth-schemas.js
import { z } from "zod";

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
