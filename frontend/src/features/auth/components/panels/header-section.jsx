// frontend/src/components/auth/panels/header-section.jsx
"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const LettersPullUp = dynamic(
  () => import("@/components/ui/letters-pull-up").then((mod) => mod.LettersPullUp),
  { ssr: true }
);


export function HeaderSection({ title, description }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 gap-6 px-8"
    >
      <motion.div variants={itemVariants}>
        <LettersPullUp
          text={title}
          className="text-primary-foreground text-4xl font-bold xl:text-5xl/15.5 leading-tight"
        />
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="text-primary-foreground text-xl leading-relaxed"
      >
        {description}
      </motion.p>
    </motion.div>
  );
}
