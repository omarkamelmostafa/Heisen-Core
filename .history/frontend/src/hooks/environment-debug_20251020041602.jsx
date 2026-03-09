// components/auth/environment-debug.jsx
"use client";

import { isDevelopment, isProduction } from "@/lib/environment";

export function EnvironmentDebug() {
  // Remove the condition to always see the debug info
  return (
    <div className="fixed top-20 right-4 bg-red-500 text-white p-2 rounded text-xs z-50">
      <div>NODE_ENV: {process.env.NODE_ENV || "undefined"}</div>
      <div>
        <div>
          NEXT_PUBLIC_API_URL: {process.env.NEXT_PUBLIC_API_URL || "undefined"}
        </div>
        NEXT_PUBLIC_APP_MODE: {process.env.NEXT_PUBLIC_APP_MODE ?? "undefined"}
        NEXT_PUBLIC_FAKE_NODE_ENV:{" "}
        {process.env.NEXT_PUBLIC_FAKE_NODE_ENV || "undefined"}
      </div>
      <div>isDevelopment: {isDevelopment ? "true" : "false"}</div>
      <div>isProduction: {isProduction ? "true" : "false"}</div>
    </div>
  );
}
