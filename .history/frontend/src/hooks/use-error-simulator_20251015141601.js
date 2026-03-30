// hooks/use-error-simulator.js
import { useState } from "react";

// All possible auth errors
export const AuthErrors = {
  NETWORK: "network_error",
  CREDENTIALS: "invalid_credentials",
  EMAIL_EXISTS: "email_exists",
  RATE_LIMIT: "rate_limit",
  EXPIRED: "expired_token",
  SERVER: "server_error",
  NOT_FOUND: "not_found",
};

export function useErrorSimulator() {
  const [error, setError] = useState(null);

  const triggerError = (errorType) => {
    setError(errorType);
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    triggerError,
    clearError,
  };
}
