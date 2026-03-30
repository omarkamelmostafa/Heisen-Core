// components/auth/error-boundary.jsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

const errorConfig = {
  network_error: {
    title: "Connection Lost",
    message:
      "Unable to connect to the server. Please check your internet connection and try again.",
    icon: "🌐",
    color: "text-orange-500",
  },
  validation_error: {
    title: "Invalid Input",
    message:
      "Please check your information and try again. Some fields may be missing or incorrect.",
    icon: "📝",
    color: "text-yellow-500",
  },
  server_error: {
    title: "Server Error",
    message:
      "Something went wrong on our end. Our team has been notified and is working on a fix.",
    icon: "⚙️",
    color: "text-red-500",
  },
  not_found: {
    title: "Page Not Found",
    message:
      "The page you're looking for doesn't exist or may have been moved.",
    icon: "🔍",
    color: "text-blue-500",
  },
  rate_limit: {
    title: "Too Many Requests",
    message:
      "You've made too many attempts. Please wait a few minutes before trying again.",
    icon: "⏰",
    color: "text-purple-500",
  },
  invalid_credentials: {
    title: "Invalid Credentials",
    message:
      "The email or password you entered is incorrect. Please try again.",
    icon: "🔐",
    color: "text-red-500",
  },
  email_exists: {
    title: "Email Already Exists",
    message:
      "An account with this email already exists. Try logging in or use a different email.",
    icon: "✉️",
    color: "text-orange-500",
  },
  expired_token: {
    title: "Link Expired",
    message: "This verification link has expired. Please request a new one.",
    icon: "⏰",
    color: "text-yellow-500",
  },
  default: {
    title: "Something Went Wrong",
    message:
      "An unexpected error occurred. Please try again or contact support if the problem persists.",
    icon: "❓",
    color: "text-gray-500",
  },
};

export function AuthErrorBoundary({
  error,
  reset,
  showBackButton = true,
  customActions = null,
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error("Auth Error:", error);
  }, [error]);

  const errorInfo = errorConfig[error?.type] || errorConfig.default;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center space-y-6"
      >
        {/* Error Icon */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="flex justify-center"
        >
          <div className={`text-6xl ${errorInfo.color}`}>{errorInfo.icon}</div>
        </motion.div>

        {/* Error Message */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-2xl font-semibold text-foreground">
            {errorInfo.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {errorInfo.message}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-3"
        >
          {customActions || (
            <>
              {reset && (
                <Button onClick={reset} className="w-full" size="lg">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              )}

              {showBackButton && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => (window.location.href = "/")}
                    className="flex-1"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Support Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xs text-muted-foreground pt-4 border-t"
        >
          <p>Need help? Contact our support team.</p>
          <p className="mt-1">Error: {error?.type || "unknown"}</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
