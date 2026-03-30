// components/
"use client";

import { motion } from "framer-motion";
import { BackgroundDecoration } from "./background-decoration";
import { ContentCard } from "./content-card";
import { HeaderSection } from "./header-section";

export function AuthRightPanel({
  title = "Welcome Back Coach!",
  description = "Ready to lead your fantasy team to championship glory? Sign in to access your full coaching dashboard, track your team's performance, and make those game-winning decisions that separate champions from the rest.",
  cardTitle = "Access Your Coaching Hub",
  cardDescription = "Secure entry to your complete fantasy management toolkit - track stats, manage rosters, and dominate your league with precision.",
}) {
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

  return (
    <div className="bg-muted h-full p-5 max-lg:hidden">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-card-foreground flex flex-col gap-6 rounded-xl border shadow-sm bg-primary relative h-full justify-between overflow-hidden border-none py-8"
      >
        {/* Header Section */}
        <HeaderSection title={title} description={description} />

        {/* Background Decoration */}
        <BackgroundDecoration />

        {/* Content Card */}
        <ContentCard cardTitle={cardTitle} cardDescription={cardDescription} />
      </motion.div>
    </div>
  );
}
