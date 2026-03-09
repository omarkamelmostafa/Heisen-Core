// hooks/use-simulated-loading.js
"use client";

import { useEffect, useState } from "react";
import { time } from "zod/v4/core/regexes.cjs";

export function useSimulatedLoading(({timeout}) => {) {
  const [isLoading, setIsLoading] = useState(true);

  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`NEXT_PUBLIC_API_URL: ${process.env.NEXT_PUBLIC_API_URL}`);
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
