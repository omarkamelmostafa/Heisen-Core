// components/ui/auth/forgot-password/success-state.jsx
import { motion } from "framer-motion";
import { successVariants } from "@/lib/animations/auth/authAnimations";
import { SuccessIcon } from "./success-icon";
import { SuccessMessage } from "./success-message";
import { TroubleshootingTips } from "./troubleshooting-tips";
import { SuccessActions } from "./success-actions";

export function SuccessState({ email, onTryAnotherEmail }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={successVariants}
      className="text-center space-y-6"
    >
      <SuccessIcon />

      <SuccessMessage email={email} />

      <div className="space-y-4">
        <TroubleshootingTips />
        <SuccessActions onTryAnotherEmail={onTryAnotherEmail} />
      </div>
    </motion.div>
  );
}
