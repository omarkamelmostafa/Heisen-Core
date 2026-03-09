// components/auth/environment-debug.jsx
"use client";

import { useState, useEffect } from "react";

export function EnvironmentDebug() {
  useEffect(() => {
    const env = process.env.NODE_ENV;

    const detectEnvironment = () => {
      if (env === "development") {
        setEnv("development");
      } else if (env === "production") {
        setEnv("production");
      } else {
        setEnv("unknown");
      }
    };
    detectEnvironment();
  }, [env]);

  const [env, setEnv] = useState(process.env.NODE_ENV);

  return (
    <div className="fixed top-20 right-4 bg-red-500 text-white p-2 rounded text-xs z-50">
      <div>NODE_ENV: {process.env.NODE_ENV}</div>
      <div>NODE_ENV: {env}</div>
      <div>
        isDevelopment:{" "}
        {process.env.NODE_ENV === "development" ? "true" : "false"}
      </div>
    </div>
  );
}
