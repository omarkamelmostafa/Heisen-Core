// validations/

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
