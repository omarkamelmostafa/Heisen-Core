// app/(auth)/forgot-password/error.jsx
"use client";

import { ErrorBoundary } from "@/components/auth/error/error-boundary";

export default function ForgotPasswordError({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />;
}
