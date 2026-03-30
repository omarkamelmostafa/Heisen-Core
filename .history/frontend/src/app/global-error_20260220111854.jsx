"use client";

import ErrorFallback from "@/components/shared/error-fallback";

/**
 * Next.js Global Error Handler
 * Catches errors in the root layout.
 * Must include <html> and <body> tags.
 */
export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <ErrorFallback
            error={error}
            reset={reset}
            title="System Error"
          />
        </div>
      </body>
    </html>
  );
}
