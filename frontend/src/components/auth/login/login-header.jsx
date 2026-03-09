// frontend/src/components/auth/login/login-header.jsx
import { Logo } from "@/components/ui/logo";
import { motion } from "framer-motion";
import { loginContent as content } from "@/lib/config/auth/login";

export function LoginHeader({ variants }) {

  return (
    <motion.div variants={variants} className="flex items-center gap-3">
      <Logo />
      <span className="text-xl font-semibold">{content.appName}</span>
    </motion.div>
  );
}
