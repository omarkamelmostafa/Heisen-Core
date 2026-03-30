// hooks/use-simulated-loading.js
"use client";

import { useEffect, useState } from "react";

export function useSimulatedLoading() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only simulate delay in development
    
    const delay = process.env.NODE_ENV === "development" ? 2000 : 500;

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, []);

  return isLoading;
}
