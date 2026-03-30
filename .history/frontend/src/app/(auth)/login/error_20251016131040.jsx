// app/(auth)/login/error.jsx
"use client";

import { useEffect } from "react";
import { ErrorBoundary } from "@/components/auth/error-boundary";

export default function LoginError({ error, reset }) {
  useEffect(() => {
    // Log to your error reporting service in production
    console.error("Login page error:", error);
  }, [error]);

  return <ErrorBoundary error={error} reset={reset} />;
}

// Development Mode:
// RussianRouletteWrapper → useErrorSimulator → ErrorBoundary (custom) + ErrorSimulator UI

// Production Mode:
// Next.js error.js → ErrorBoundary (same component, no simulation)

// Development: Component Error → RussianRouletteWrapper → ErrorBoundary (with simulation)
// Production:  Component Error → Next.js error.js → ErrorBoundary (real error)
