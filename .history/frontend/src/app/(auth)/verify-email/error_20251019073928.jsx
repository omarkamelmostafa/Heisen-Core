// app/(auth)/verify-email/error.jsx
"use client";

import { ErrorBoundary } from "@/components/auth/error/error-boundary";

export default function VerifyEmailError({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />;
}
