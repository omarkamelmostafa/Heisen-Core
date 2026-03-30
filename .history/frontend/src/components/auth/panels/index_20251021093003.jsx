"use client";

import { motion } from "framer-motion";
import { BackgroundDecoration } from "./background-decoration";
import { ContentCard } from "./content-card";
import { HeaderSection } from "./header-section";

export function AuthRightPanel({
  title = "Welcome back! Please sign in to your Fantasy Coach account",
  description = "Thank you for registering! Please check your inbox and click the verification link to activate your account.",
  cardTitle = "Please enter your login details",
  cardDescription = "Stay connected with Fantasy Coach. Subscribe now for the latest updates and news.",
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

export { AuthRightPanel } from "./auth-right-panel";
