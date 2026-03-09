// components/auth/panels/content-card.jsx
"use client";

import { motion } from "framer-motion";

export function ContentCard({ cardTitle, cardDescription }) {
  const slideInVariants = {
    hidden: { x: 30, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.7,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={slideInVariants}
      className="relative z-10 mx-8 h-62 overflow-hidden rounded-2xl px-0"
    >
      {/* Card Background SVG */}
      <motion.svg
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        width="1094"
        height="249"
        viewBox="0 0 1094 249"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="pointer-events-none absolute right-0 -z-10 select-none"
      >
        <path
          d="M0.263672 16.8809C0.263672 8.0443 7.42712 0.880859 16.2637 0.880859H786.394H999.115C1012.37 0.880859 1023.12 11.626 1023.12 24.8808L1023.12 47.3809C1023.12 60.6357 1033.86 71.3809 1047.12 71.3809H1069.6C1082.85 71.3809 1093.6 82.126 1093.6 95.3809L1093.6 232.881C1093.6 241.717 1086.43 248.881 1077.6 248.881H16.2637C7.42716 248.881 0.263672 241.717 0.263672 232.881V16.8809Z"
          fill="var(--card)"
        />
      </motion.svg>

      {/* Card Icon */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1.4, type: "spring", stiffness: 100 }}
        className="bg-card p-2 absolute top-0 right-0 flex size-15 items-center justify-center rounded-2xl"
      >
        {/* Your icon SVG here */}
      </motion.div>

      {/* Card Content */}
      <div className="flex flex-col gap-5 p-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="line-clamp-2 pr-12 text-3xl font-bold text-card-foreground"
        >
          {cardTitle}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="line-clamp-2 text-lg text-card-foreground/80"
        >
          {cardDescription}
        </motion.p>
      </div>
    </motion.div>
  );
}
