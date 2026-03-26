// frontend/src/features/auth/components/panels/auth-right-panel.jsx
"use client";

import { motion } from "framer-motion";
import { BackgroundDecoration } from "./background-decoration";
import { ContentCard } from "./content-card";
import { HeaderSection } from "./header-section";
import { AppSplashScreen } from "@/components/shared/app-splash-screen";

export function AuthRightPanel({
  title = "Welcome!",
  description = "Sign in to access your dashboard and manage your projects with precision and efficiency.",
  cardTitle = "Secure Access",
  cardDescription = "Enter your credentials to access your workspace and continue where you left off.",
  isLoading = false,
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

  // Show splash screen during loading transitions
  if (isLoading) {
    return (
      <div className="bg-muted h-full p-5 max-lg:hidden">
        <div className="flex h-full items-center justify-center rounded-xl bg-primary">
          <AppSplashScreen message="Loading..." showProgress={true} />
        </div>
      </div>
    );
  }

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
