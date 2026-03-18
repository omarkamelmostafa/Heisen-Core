// frontend/src/components/auth/providers/auth-providers.jsx
"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function AuthProviders({
  providers = ["google", "facebook"],
  disabledProviders = ["google", "facebook"],
  layout = "horizontal",
  context = "login", // "login" | "signup"
  variants, // For motion animation
  className = "", // Additional classes
}) {
  // Provider configurations
  const providerConfigs = {
    google: {
      label: context === "login" ? "Login With Google" : "Sign up With Google",
      icon: (
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      ),
    },
    facebook: {
      label:
        context === "login" ? "Login With Facebook" : "Sign up With Facebook",
      icon: (
        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  };

  // Filter providers based on the providers prop
  const enabledProviders = providers
    .filter((provider) => providerConfigs[provider])
    .map((provider) => ({
      ...providerConfigs[provider],
      provider,
      disabled: disabledProviders.includes(provider),
    }));

  return (
    <motion.div
      variants={variants}
      className={`flex flex-col sm:flex-row gap-2 ${className}`}
    >
      {enabledProviders.map(({ provider, label, icon, disabled }) => (
        <div key={provider} className="relative w-full">
          <Button
            variant="outline"
            className="w-full disabled:opacity-50"
            disabled={disabled}
          >
            {icon}
            {label}
          </Button>
          {disabled && (
            <span className="absolute -top-2 -right-2 px-2 py-1 text-xs font-medium bg-emerald-500 text-white rounded-full shadow-sm border-0">
              Soon
            </span>
          )}
        </div>
      ))}
    </motion.div>
  );
}
