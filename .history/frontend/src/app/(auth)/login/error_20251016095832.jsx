Development Mode:
RussianRouletteWrapper → useErrorSimulator → ErrorBoundary (custom) + ErrorSimulator UI

Production Mode:
Next.js error.js → ErrorBoundary (same component, no simulation)
// app/(auth)/login/error.jsx
"use client";

import { ErrorBoundary } from "@/components/auth/error-boundary";

export default function LoginError({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />;
}
