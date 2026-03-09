"use client";

import { motion } from "framer-motion";

export default function FloatingShape() {
  return (
    <motion.div
      className="fixed bottom-10 right-10 w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-xl opacity-50 z-[-1]"
      animate={{
        y: [0, -20, 0],
        x: [0, 10, 0],
        rotate: [0, 15, 0],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}
