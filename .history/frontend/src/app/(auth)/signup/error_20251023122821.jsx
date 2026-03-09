// fr
// frontend/src/app/(auth)/signup/error.jsx
"use client";

import { ErrorBoundary } from "@/components/auth/error/error-boundary";

export default function SignupError({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />;
}

// Development: Component Error → DevWrapper → ErrorBoundary (with simulation)
// Production:  Component Error → Next.js error.js → ErrorBoundary (real error)
