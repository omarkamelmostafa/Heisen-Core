// frontend/src/features/auth/components/login/login-header.jsx
import { Logo } from "@/components/ui/logo";
import { motion } from "framer-motion";
import { BRAND } from "@/lib/config/brand-config";

export function LoginHeader({ variants }) {

  return (
    <motion.div variants={variants} className="flex items-center gap-3">
      <Logo />
      <span className="text-xl font-semibold">{BRAND.APP_NAME}</span>
    </motion.div>
  );
}
