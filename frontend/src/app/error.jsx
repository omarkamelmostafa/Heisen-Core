// frontend/src/app/error.jsx
"use client";

import { useEffect } from "react";
import ErrorFallback from "@/components/shared/error-fallback";
import { isDevelopment } from "@/lib/environment";

/**
 * Next.js App Router Segment Error Handler
 */
export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (isDevelopment) {
      console.error("Segment Error Boundary:", error);
    }
  }, [error]);

  return (
    <div className="container mx-auto py-20 px-6">
      <ErrorFallback error={error} reset={reset} />
    </div>
  );
}
