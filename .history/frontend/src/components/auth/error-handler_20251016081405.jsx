// components/auth/error-handler.jsx
"use client";

import { useErrorSimulator } from "@/hooks/use-error-simulator";
import { ErrorBoundary } from "./error-boundary";
import { ErrorSimulator } from "./error-simulator";

export function ErrorHandler({ children }) {
  const { error, triggerError, clearError, isDevelopment } =
    useErrorSimulator();

  // Clean conditional rendering - show error or children
  if (error) {
    return (
      <>
        <ErrorBoundary error={error} onRetry={clearError} />
        {isDevelopment && <ErrorSimulator onTriggerError={triggerError} />}
      </>
    );
  }

  // Normal page content with error simulator in dev
  return (
    <>
      {children}
      {isDevelopment && <ErrorSimulator onTriggerError={triggerError} />}
    </>
  );
}
