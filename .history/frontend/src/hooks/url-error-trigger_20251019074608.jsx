// components/auth/url-error-trigger.jsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export function UrlErrorTrigger() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const triggerError = searchParams.get("test_error");

    if (triggerError === "boundary") {
      throw new Error("URL-triggered error boundary test");
    }

    if (triggerError === "runtime") {
      throw new Error("URL-triggered runtime error");
    }

    if (triggerError === "undefined") {
      const obj = undefined;
      console.log(obj.nonExistentProperty);
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}
