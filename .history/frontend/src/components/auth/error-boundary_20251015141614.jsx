// components/auth/error-boundary.jsx
"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Home, ArrowLeft } from "lucide-react";

const errorMessages = {
  network_error: {
    title: "Connection Issue",
    message: "Check your internet and try again.",
  },
  invalid_credentials: {
    title: "Invalid Login",
    message: "Wrong email or password. Please try again.",
  },
  email_exists: {
    title: "Email Taken",
    message: "An account with this email already exists.",
  },
  rate_limit: {
    title: "Too Many Attempts",
    message: "Please wait a few minutes before trying again.",
  },
  expired_token: {
    title: "Link Expired",
    message: "This link has expired. Please request a new one.",
  },
  server_error: {
    title: "Server Error",
    message: "Something went wrong. We're working on it.",
  },
  not_found: {
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist.",
  },
};

export function ErrorBoundary({ error, reset, showBack = true }) {
  const errorInfo = errorMessages[error] || errorMessages.server_error;

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Error Icon */}
        <div className="text-6xl">⚠️</div>

        {/* Error Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">{errorInfo.title}</h2>
          <p className="text-muted-foreground">{errorInfo.message}</p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {reset && (
            <Button onClick={reset} className="w-full" size="lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}

          {showBack && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                className="flex-1"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
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
        </div>
      </div>
    </div>
  );
}
