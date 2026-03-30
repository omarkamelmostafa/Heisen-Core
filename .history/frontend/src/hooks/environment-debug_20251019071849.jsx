// components/auth/environment-debug.jsx
"use client";

import { isDevelopment } from "@/lib/environment";

export function EnvironmentDebug() {

  if (isDevelopment){
    return null
  }
  return (
    <div className="fixed top-20 right-4 bg-red-500 text-white p-2 rounded text-xs z-50">
      <div>NODE_ENV: {process.env.NODE_ENV}</div>
      <div>
        isDevelopment:{" "}
        {process.env.NODE_ENV === "development" ? "true" : "false"}
      </div>
    </div>
  );
}
