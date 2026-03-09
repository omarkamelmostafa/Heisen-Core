"use client";
import { motion } from "framer-motion";

export function FantasyLoader({
  message = "Preparing your fantasy experience...",
  showProgress = true
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Logo Container */}
      <motion.div
        className="relative mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Outer Glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-blue-500 blur-xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Main Logo Circle */}
        <motion.div
          className="relative h-32 w-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl border border-blue-400"
          animate={{
            rotateY: [0, 180, 360],
            boxShadow: [
              "0 0 20px rgba(59, 130, 246, 0.5)",
              "0 0 40px rgba(147, 51, 234, 0.7)",
              "0 0 20px rgba(59, 130, 246, 0.5)"
            ]
          }}
          transition={{
            rotateY: { duration: 3, repeat: Infinity, ease: "linear" },
            boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
          }}
        >
          {/* Inner Ring */}
          <motion.div
            className="absolute h-24 w-24 rounded-full border-2 border-white border-opacity-30"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Logo Text */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.h1
              className="text-white font-bold text-lg leading-tight"
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Fantasy
            </motion.h1>
            <motion.h2
              className="text-blue-200 font-semibold text-sm"
              animate={{ y: [0, 2, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
            >
              Coach
            </motion.h2>
          </motion.div>
        </motion.div>

        {/* Floating Particles */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-2 w-2 bg-blue-400 rounded-full"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: [0, Math.cos(i * 90) * 60],
              y: [0, Math.sin(i * 90) * 60]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Loading Message */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <motion.p
          className="text-white text-lg font-light mb-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {message}
        </motion.p>

        {/* Animated Dots */}
        <motion.div className="flex justify-center space-x-1">
          {[0, 1, 2].map((dot) => (
            <motion.div
              key={dot}
              className="h-1 w-1 bg-blue-300 rounded-full"
              animate={{ scale: [0.5, 1.2, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: dot * 0.2
              }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Progress Bar */}
      {showProgress && (
        <motion.div
          className="w-64 bg-gray-700 bg-opacity-50 rounded-full h-1 overflow-hidden"
          initial={{ opacity: 0, scaleX: 0.8 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}

      {/* Subtle Footer Text */}
      <motion.div
        className="absolute bottom-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <p className="text-gray-400 text-sm">Your ultimate fantasy sports companion</p>
      </motion.div>
    </div>
  );
}

// Simple variant for inline loading
export function SimpleFantasyLoader({ size = "md" }) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  return (
    <motion.div
      className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 ${sizes[size]}`}
      animate={{
        rotate: [0, 180, 360],
        scale: [1, 1.1, 1]
      }}
      transition={{
        rotate: { duration: 1.5, repeat: Infinity, ease: "linear" },
        scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
      }}
    />
  );
}