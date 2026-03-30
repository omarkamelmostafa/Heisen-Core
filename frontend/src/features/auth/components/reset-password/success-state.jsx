// frontend/src/features/auth/components/reset-password/success-state.jsx
import { motion } from "framer-motion";
import { successVariants } from "@/lib/animations/auth/authAnimations";
import { SuccessIcon } from "./success-icon";
import { SuccessMessage } from "./success-message";
import { SuccessActions } from "./success-actions";
import { SecurityTips } from "./security-tips";

export function SuccessState() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={successVariants}
      className="text-center space-y-6"
    >
      <SuccessIcon />
      <SuccessMessage />
      <SuccessActions />
      <SecurityTips />
    </motion.div>
  );
}
