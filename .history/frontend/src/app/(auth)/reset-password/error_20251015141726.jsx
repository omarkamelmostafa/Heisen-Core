// app/(auth)/reset-password/error.jsx
"use client";

import { ErrorBoundary } from "@/components/auth/error-boundary";

export default function ResetPasswordError({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />;
}
