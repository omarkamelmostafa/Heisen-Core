// frontend/src/features/auth/components/reset-password/success-icon.jsx
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { iconVariants } from "@/lib/animations/auth/authAnimations";

export function SuccessIcon() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={iconVariants}
      className="flex justify-center"
    >
      <CheckCircle className="h-16 w-16 text-emerald-500" />
    </motion.div>
  );
}
