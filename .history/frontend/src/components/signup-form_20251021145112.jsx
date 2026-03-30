import { motion } from "framer-motion";
import { FormField } from "@/components/auth/forms/form-field";
import { AuthSubmitButtons } from "@/components/auth/forms/auth-submit-button";
import { NameFields } from "./name-fields";
import { PasswordFields } from "./password-fields";
import { PasswordStrengthMeter } from "@/components/auth/shared/password-strength-meter";
import { PasswordMatchIndicator } from "@/components/auth/shared/password-match-indicator";
import { TermsAndConditions } from "./terms-and-conditions";
import { SignupOptions } from "./signup-options";
import { useSignupContent } from "@/lib/config/auth-content";
import { useFormContext } from "react-hook-form";

export function SignupForm({
  variants,
  showPassword,
  showConfirmPassword,
  isLoading,
  onTogglePassword,
  onToggleConfirmPassword,
}) {
  const content = useSignupContent();
  const { watch } = useFormContext();

  const formData = watch();
  const password = watch("password");
  const confirmPassword = watch("confirmPassword");

  return (
    <motion.div variants={variants} className="space-y-4">
      <div className="space-y-4">
        <NameFields isLoading={isLoading} />

        <FormField
          name="email"
          type="email"
          label={content.form.email.label}
          placeholder={content.form.email.placeholder}
          required
          disabled={isLoading}
        />

        <PasswordFields
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          isLoading={isLoading}
          onTogglePassword={onTogglePassword}
          onToggleConfirmPassword={onToggleConfirmPassword}
        />

        <PasswordStrengthMeter password={password} className="mt-2" />

        <PasswordMatchIndicator
          password={password}
          confirmPassword={confirmPassword}
          className="mt-2"
        />

        <TermsAndConditions isLoading={isLoading} />

        <AuthSubmitButtons.Signup
          isLoading={isLoading}
          formData={formData}
          buttonText={content.buttons.signup}
          loadingText={content.buttons.signingUp}
        />
      </div>

      <SignupOptions />
    </motion.div>
  );
}
// components/auth/forms/signup-form.jsx
// "use client";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { signupSchema } from "@/lib/validations/auth";
// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import {
//   Field,
//   FieldGroup,
//   FieldLabel,
//   FieldSeparator,
// } from "@/components/ui/field";
// import { Input } from "@/components/ui/input";
// import { UserPlus } from "lucide-react";

// export function SignupForm({ className, ...props }) {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//   } = useForm({
//     resolver: zodResolver(signupSchema),
//   });

//   const onSubmit = async (data) => {
//     const { confirmPassword, ...signupData } = data;

//     try {
//       const response = await fetch("/api/auth/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(signupData),
//       });

//       if (!response.ok) throw new Error("Signup failed");
//       console.log("Signup successful");
//     } catch (error) {
//       console.error("Signup error:", error);
//     }
//   };

//   return (
//     <form
//       className={cn("flex flex-col gap-2", className)}
//       onSubmit={handleSubmit(onSubmit)}
//       {...props}
//     >
//       <FieldGroup className="gap-4">
//         <div className="flex flex-col items-center gap-1 text-center">
//           <h1 className="text-2xl font-bold">Create an account</h1>
//           <p className="text-muted-foreground text-sm text-balance">
//             Enter your details to create your account
//           </p>
//         </div>

//         <Field>
//           <FieldLabel htmlFor="name">Full Name</FieldLabel>
//           <Input
//             id="name"
//             type="text"
//             placeholder="John Doe"
//             {...register("name")}
//           />
//           {errors.name && (
//             <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
//           )}
//         </Field>

//         <Field>
//           <FieldLabel htmlFor="email">Email</FieldLabel>
//           <Input
//             id="email"
//             type="email"
//             placeholder="m@example.com"
//             {...register("email")}
//           />
//           {errors.email && (
//             <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
//           )}
//         </Field>

//         <Field>
//           <FieldLabel htmlFor="password">Password</FieldLabel>
//           <Input id="password" type="password" {...register("password")} />
//           {errors.password && (
//             <p className="text-sm text-red-500 mt-1">
//               {errors.password.message}
//             </p>
//           )}
//         </Field>

//         <Field>
//           <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
//           <Input
//             id="confirmPassword"
//             type="password"
//             {...register("confirmPassword")}
//           />
//           {errors.confirmPassword && (
//             <p className="text-sm text-red-500 mt-1">
//               {errors.confirmPassword.message}
//             </p>
//           )}
//         </Field>

//         <Field>
//           <Button type="submit" disabled={isSubmitting}>
//             {isSubmitting ? "Creating account..." : "Create account"}
//             <UserPlus className="ml-2 size-4" />
//           </Button>
//         </Field>

//         <FieldSeparator></FieldSeparator>

//         <Field>
//           <p className="text-muted-foreground text-sm text-center mt-2">
//             Already have an account?{" "}
//             <a href="/login" className="underline underline-offset-4">
//               Sign in
//             </a>
//           </p>
//         </Field>
//       </FieldGroup>
//     </form>
//   );
// }
