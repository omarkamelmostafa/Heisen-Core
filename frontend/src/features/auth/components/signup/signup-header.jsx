// frontend/src/features/auth/components/signup/signup-header.jsx
import { Logo } from "@/components/ui/logo";
import { BRAND } from "@/lib/config/brand-config";
import { motion } from "framer-motion";

export function SignupHeader({ variants }) {

  return (
    <motion.div variants={variants} className="flex items-center gap-3">
      <Logo />
      <span className="text-xl font-semibold">{BRAND.APP_NAME}</span>
    </motion.div>
  );
}
