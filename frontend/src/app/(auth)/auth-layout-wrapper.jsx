// frontend/src/app/(auth)/auth-layout-wrapper.jsx
"use client";

import { motion } from "framer-motion";

export function AuthLayoutWrapper({ children }) {
  return (
    <main id="main-content" className="flex-1 overflow-y-auto">
      <div className="min-h-[calc(100vh-3.5rem)] flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex-1 flex flex-col items-center py-12 sm:py-16 px-4 sm:px-6"
        >
          <div className="w-full max-w-md">{children}</div>
        </motion.div>
      </div>
    </main>
  );
}
