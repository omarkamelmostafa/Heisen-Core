/**
 * AppSplashScreen — Full-screen loading state for app initialization.
 *
 * Used by:
 * - src/app/loading.jsx (root layout loading)
 * - src/app/(auth)/loading.jsx (auth route group loading)
 * - src/providers/store-provider.jsx (Redux PersistGate loading)
 *
 * Design rules:
 * - Uses design token CSS variables (bg-background, text-foreground, etc.)
 * - Dark mode compatible via token inheritance
 * - Minimal animation: logo spring-in, text fade, pulsing dots
 * - No hover effects (loading screen — nothing to interact with)
 * - No scroll detection (always fullscreen, always in view)
 */
"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/ui/logo";
import { BRAND } from "@/lib/config/brand-config";

export function AppSplashScreen({
  message,
  showProgress = true,
}) {
  const t = useTranslations("infrastructure");
  const displayMessage = message || t("loading");
  return (
    <div className="flex h-full w-full flex-col items-center justify-center min-h-screen bg-background px-4">
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
        }}
        className="mb-6 sm:mb-8"
      >
        <Logo className="size-16 sm:size-20 md:size-24 drop-shadow-lg" />
      </motion.div>

      {/* App Name */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4"
      >
        {BRAND.APP_NAME}
      </motion.h1>

      {/* Loading Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="text-muted-foreground text-base sm:text-lg text-center max-w-md mb-6 sm:mb-8"
      >
        {displayMessage}
      </motion.p>

      {/* Pulsing Dots Progress Indicator */}
      {showProgress && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex space-x-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="size-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}
