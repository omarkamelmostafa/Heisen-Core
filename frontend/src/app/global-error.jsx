// frontend/src/app/global-error.jsx
"use client";

import { useEffect } from "react";
import ErrorFallback from "@/components/shared/error-fallback";
import { NextIntlClientProvider } from "next-intl";

/**
 * Next.js Global Error Handler
 * Catches errors in the root layout.
 * Must include <html> and <body> tags.
 */
export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  // Inline fallback messages since global-error cannot access NextIntlClientProvider context
  // These match the keys in messages/en.json and messages/ar.json
  const fallbackMessages = {
    errors: {
      somethingWentWrong: "Something went wrong",
      tryAgain: "Try Again",
      appError: "We encountered an issue loading the page. Please try again.",
      systemError: "System Error",
      goBack: "Go Back",
      goHome: "Go Home"
    }
  };

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <NextIntlClientProvider locale="en" messages={fallbackMessages}>
            <ErrorFallback
              error={error}
              reset={reset}
              title={fallbackMessages.errors.systemError}
            />
          </NextIntlClientProvider>
        </div>
      </body>
    </html>
  );
}
