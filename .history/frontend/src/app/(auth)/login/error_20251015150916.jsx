// app/(auth)/login/error.jsx
"use client";

import { ErrorBoundary } from "@/components/auth/error-boundary";

export default function LoginError({ error, reset }) {
  return <ErrorBoundary error={error} reset={reset} />;
}
