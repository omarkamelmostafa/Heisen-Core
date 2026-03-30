// app/(auth)/signup/error.jsx
"use client";

import { ErrorBoundary } from "@/components/auth/error/error-boundary";

export default function LoginError({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />;
}
