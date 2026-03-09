// hooks/use-error-simulator.js
import { useState } from "react";

export function useErrorSimulator() {
  const [shouldError, setShouldError] = useState(false);

  // Russian roulette - 1 in 6 chance of error in development
  const triggerRandomError = () => {
    if (process.env.NODE_ENV === "development") {
      const random = Math.floor(Math.random() * 6) + 1; // 1-6
      if (random === 1) {
        // 1/6 chance
        setShouldError(true);
        return true;
      }
    }
    return false;
  };

  const clearError = () => {
    setShouldError(false);
  };

  return {
    shouldError,
    triggerRandomError,
    clearError,
  };
}
