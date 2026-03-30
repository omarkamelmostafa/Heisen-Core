// app/(auth)/login/error.jsx
"use client";

import { ErrorBoundary } from "@/components/auth/error/error-boundary";

export default function LoginError({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />;
}

// Development: Component Error → RussianRouletteWrapper → ErrorBoundary (with simulation)
// Production:  Component Error → Next.js error.js → ErrorBoundary (real error)
