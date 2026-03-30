// hooks/use-error-toggle.js
import { useState } from "react";

export function useErrorToggle() {
  const [shouldError, setShouldError] = useState(false);

  const triggerError = () => {
    setShouldError(true);
  };

  const clearError = () => {
    setShouldError(false);
  };

  return {
    shouldError,
    triggerError,
    clearError,
  };
}
