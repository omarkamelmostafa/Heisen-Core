// frontend/src/components/shared/error-fallback.jsx
"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Home, ArrowLeft, AlertCircle } from "lucide-react";
import { isDevelopment } from "@/lib/environment";

/**
 * Shared Error Fallback UI
 * Used by both React ErrorBoundary and Next.js error segments.
 */
export function ErrorFallback({ error, reset, title }) {
  const errorMessage =
    error?.message ||
    "Oops, something went wrong on our end. Please try again later.";

  const errorTitle = title || error?.title || "Something Went Wrong";

  return (
    <div className="min-h-[400px] flex items-center justify-center bg-background p-6 rounded-xl border border-border/50">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Development Banner */}
        {isDevelopment && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span className="font-bold text-yellow-500 text-sm">
                DEVELOPMENT MODE
              </span>
            </div>
            <p className="text-xs text-yellow-600/80 mt-1">
              {error?.stack?.split('\n')[0] || "Component Error Detected"}
            </p>
          </div>
        )}

        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="bg-muted rounded-full p-4">
            <AlertCircle className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>

        {/* Error Message */}
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            {errorTitle}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {errorMessage}
          </p>

          {isDevelopment && error?.stack && (
            <div className="mt-4 p-3 bg-muted/50 rounded-md text-left overflow-auto max-h-32">
              <pre className="text-[10px] text-muted-foreground font-mono">
                {error.stack}
              </pre>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {reset && (
            <Button onClick={reset} className="w-full" size="lg">
              <RefreshCw className="h-4 w-4 mr-2" />
              {isDevelopment ? "Clear & Retry" : "Try Again"}
            </Button>
          )}

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
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ErrorFallback;
