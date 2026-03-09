// frontend/srchooks/use-simulated-loading.js
"use client";

import { useEffect, useState } from "react";

export function useSimulatedLoading(timeout = 500) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const delay = process.env.NODE_ENV === "development" ? timeout : 0;

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [timeout]);

  return isLoading;
}
