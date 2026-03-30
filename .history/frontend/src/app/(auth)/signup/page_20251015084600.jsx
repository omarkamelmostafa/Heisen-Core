// app/(auth)/signup/page.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/auth/form-field";
import {
  motionProps,
  containerVariants,
  itemVariants,
} from "@/lib/animations/auth/authAnimations";
import { AuthSubmitButtons } from "@/components/auth/auth-submit-button";
import { useSimulatedLoading } from "@/hooks/use-simulated-loading";
import SignupLoading from "./loading";
import { AuthLayoutWrapper } from "../auth-layout-wrapper";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  async function onSubmit(event) {
    event.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.push("/");
    }, 2000);
  }

  const isLoadingPage = useSimulatedLoading(0);
  // This will show loading.jsx until the hook returns false
  if (isLoadingPage) {
    return <SignupLoading />;
  }

  return (
    <div className="flex min-h-[100vh] items-center justify-center overflow-hidden">
      <motion.div
        {...motionProps.page}
        className="flex h-full items-center justify-center space-y-6 sm:px-6 md:px-8"
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="flex w-full flex-col gap-6 sm:max-w-lg"
        >
          {/* Header with Logo */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3"
          >
            <Logo />
            <span className="text-xl font-semibold">Fantasy Coach</span>
          </motion.div>
          {/* Welcome Section */}
          <motion.div variants={itemVariants}>
            <h2 className="mb-1.5 text-2xl font-semibold">Create Account</h2>
            <p className="text-muted-foreground">
              Join Fantasy Coach and start building your dream team today!
            </p>
          </motion.div>

          {/* Sign Up Form */}
          <motion.div variants={itemVariants} className="space-y-4">
            <form onSubmit={onSubmit} className="space-y-4">
              {/* Name Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name Field */}
                <FormField
                  name="firstName"
                  type="text"
                  label="First Name"
                  placeholder="Enter your first name"
                  required
                  disabled={isLoading}
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                />

                {/* Last Name Field */}
                <FormField
                  name="lastName"
                  type="text"
                  label="Last Name"
                  placeholder="Enter your last name"
                  required
                  disabled={isLoading}
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
              </div>

              {/* Email Field */}
              <FormField
                name="userEmail"
                type="email"
                label="Email address"
                placeholder="Enter your email address"
                required
                disabled={isLoading}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              {/* Password Field */}
              <FormField
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Create a strong password"
                required
                disabled={isLoading}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                showPasswordToggle={true}
                onTogglePassword={() => setShowPassword(!showPassword)}
              />

              {/* Confirm Password Field */}
              <FormField
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                placeholder="Confirm your password"
                required
                disabled={isLoading}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                showPasswordToggle={true}
                onTogglePassword={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
              />

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox id="terms" disabled={isLoading} className="mt-1" />
                <Label
                  htmlFor="terms"
                  className="text-sm font-normal text-muted-foreground"
                >
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              {/* Submit Button */}
              <AuthSubmitButtons.Signup
                isLoading={isLoading}
                formData={formData}
              />
            </form>

            {/* Login Link */}
            <p className="text-muted-foreground text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-foreground hover:underline font-medium"
              >
                Sign in here
              </Link>
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
