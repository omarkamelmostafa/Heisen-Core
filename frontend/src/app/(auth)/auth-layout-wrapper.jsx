// frontend/src/app/(auth)/auth-layout-wrapper.jsx
"use client";

import { motion } from "framer-motion";

export function AuthLayoutWrapper({ children }) {
  return (
    <div className="min-h-full grid grid-cols-1">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center p-4 w-full"
      >
        <div className="w-full max-w-md mx-auto">{children}</div>
      </motion.div>
    </div>
  );
}
