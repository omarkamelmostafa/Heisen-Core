// hooks/use-error-simulator.js
import { useState, useEffect } from "react";

export function useErrorSimulator(errorType = null, delay = 0) {
  const [simulatedError, setSimulatedError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (errorType && delay > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setSimulatedError(errorType);
        setIsLoading(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [errorType, delay]);

  const triggerError = (type, customDelay = 0) => {
    setIsLoading(true);
    setTimeout(() => {
      setSimulatedError(type);
      setIsLoading(false);
    }, customDelay);
  };

  const clearError = () => {
    setSimulatedError(null);
  };

  return {
    simulatedError,
    isLoading,
    triggerError,
    clearError,
  };
}

// Predefined error types for auth pages
export const AuthErrorTypes = {
  NETWORK_ERROR: "network_error",
  VALIDATION_ERROR: "validation_error",
  SERVER_ERROR: "server_error",
  NOT_FOUND: "not_found",
  RATE_LIMIT: "rate_limit",
  INVALID_CREDENTIALS: "invalid_credentials",
  EMAIL_EXISTS: "email_exists",
  EXPIRED_TOKEN: "expired_token",
};
