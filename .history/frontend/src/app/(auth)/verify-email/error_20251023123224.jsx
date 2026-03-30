// frontend/srcapp/(auth)/verify-email/error.jsx
"use client";

import { ErrorBoundary } from "@/components/auth/error/error-boundary";

export default function VerifyEmailError({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />;
}

// Development: Component Error → DevWrapper → ErrorBoundary (with simulation)
// Production:  Component Error → Next.js error.js → ErrorBoundary (real error)
