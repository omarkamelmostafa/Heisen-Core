// lib/
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
  .min(6, "Password must be at least 6 characters")
  .max(20, "Password must be at most 20 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
    "Password must contain at least one special character"
  );

// Login Schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

// Signup Schema
export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name is too long"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name is too long"),
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

// Export types for TypeScript (optional)
export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

// // Common validation messages
// const validationMessages = {
//   required: "This field is required",
//   email: "Please enter a valid email address",
//   minLength: (min) => `Must be at least ${min} characters`,
//   maxLength: (max) => `Must be less than ${max} characters`,
// };

// // Base schemas
// export const emailSchema = z
//   .string()
//   .min(1, validationMessages.required)
//   .email(validationMessages.email);

// export const passwordSchema = z
//   .string()
//   .min(
//     PASSWORD_RULES.minLength,
//     validationMessages.minLength(PASSWORD_RULES.minLength)
//   )
//   .max(
//     PASSWORD_RULES.maxLength,
//     validationMessages.maxLength(PASSWORD_RULES.maxLength)
//   )
//   .regex(/[A-Z]/, "Must contain at least one uppercase letter")
//   .regex(/[a-z]/, "Must contain at least one lowercase letter")
//   .regex(/[0-9]/, "Must contain at least one number")
//   .regex(
//     /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
//     "Must contain at least one special character"
//   );

// export const nameSchema = z
//   .string()
//   .min(1, validationMessages.required)
//   .min(2, "Must be at least 2 characters")
//   .max(50, "Must be less than 50 characters");

// // Form schemas
// export const loginSchema = z.object({
//   email: emailSchema,
//   password: z.string().min(1, validationMessages.required),
//   rememberMe: z.boolean().optional(),
// });

// export const signupSchema = z
//   .object({
//     firstName: nameSchema,
//     lastName: nameSchema,
//     email: emailSchema,
//     password: passwordSchema,
//     confirmPassword: z.string().min(1, validationMessages.required),
//     terms: z.boolean().refine((val) => val === true, {
//       message: "You must accept the terms and conditions",
//     }),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

// export const forgotPasswordSchema = z.object({
//   email: emailSchema,
// });

// export const resetPasswordSchema = z
//   .object({
//     password: passwordSchema,
//     confirmPassword: z.string().min(1, validationMessages.required),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords do not match",
//     path: ["confirmPassword"],
//   });

// export const verifyEmailSchema = z.object({
//   code: z
//     .array(z.string().length(1, "Each digit is required"))
//     .length(6, "Code must be 6 digits"),
// });
