// frontend/src/components/auth/error/dev-wrapper.jsx
"use client";

import { useErrorToggle } from "@/hooks/use-error-toggle";
import { ErrorFallback } from "@/components/shared/error-fallback";
import { DevErrorToggle } from "./dev-error-toggle";
import { isDevelopment } from "@/lib/environment";

export function DevWrapper({ children }) {
  const { shouldError, triggerError, clearError } = useErrorToggle();

  // In production: just render children
  if (!isDevelopment) {
    return children;
  }

  // In development: conditionally show error or children
  if (shouldError) {
    return (
      <>
        <ErrorFallback
          error={{
            title: "Development Error Test",
            message:
              "This is a simulated error for testing the error boundary in development mode.",
          }}
          reset={clearError}
        />
        <DevErrorToggle
          onTriggerError={triggerError}
          onClearError={clearError}
          isErrorActive={true}
        />
      </>
    );
  }

  return (
    <>
      {children}
      <DevErrorToggle
        onTriggerError={triggerError}
        onClearError={clearError}
        isErrorActive={false}
      />
    </>
  );
}
