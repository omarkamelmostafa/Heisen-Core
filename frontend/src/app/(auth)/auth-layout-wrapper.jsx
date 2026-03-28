// frontend/src/app/(auth)/auth-layout-wrapper.jsx
"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { AuthRightPanel } from "@/features/auth/components/panels/auth-right-panel";
import { motion } from "framer-motion";

export function AuthLayoutWrapper({ children }) {
  const pathname = usePathname();
  const t = useTranslations("auth.layout");

  // Map pathnames to content keys
  const getConfig = (path) => {
    const routeMap = {
      "/login": "login",
      "/signup": "signup",
      "/verify-email": "verifyEmail",
      "/forgot-password": "forgotPassword",
      "/reset-password": "resetPassword",
    };
    const key = routeMap[path] || "login";
    return {
      title: t(`${key}.title`),
      description: t(`${key}.description`),
      cardTitle: t(`${key}.cardTitle`),
      cardDescription: t(`${key}.cardDescription`),
    };
  };

  const config = getConfig(pathname);

  // Animation variants
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
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-full grid grid-cols-1 lg:grid-cols-2">
      {/* Left side - Auth Form */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center p-4 w-full scale-100 lg:scale-100"
      >
        <div className="w-full max-w-md mx-auto">{children}</div>
      </motion.div>

      {/* Right side - Panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-lg:hidden"
      >
        <AuthRightPanel
          key={pathname}
          {...config}
          variants={{ container: containerVariants, item: itemVariants }}
        />
      </motion.div>
    </div>
  );
}
