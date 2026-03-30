"use client";

import { useEffect } from "react";

export function SuppressConsoleErrors() {
  useEffect(() => {
    const originalError = console.error;

    console.error = (...args) => {
      // Suppress Chrome extension port errors
      if (
        args[0] &&
        typeof args[0] === "string" &&
        args[0].includes(
          "The message port closed before a response was received"
        )
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
