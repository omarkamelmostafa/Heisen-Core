// frontend/src/features/auth/components/signup/signup-header.jsx
import { Logo } from "@/components/ui/logo";
import { motion } from "framer-motion";
import { signupContent as content } from "@/lib/config/auth/signup";

export function SignupHeader({ variants }) {

  return (
    <motion.div variants={variants} className="flex items-center gap-3">
      <Logo />
      <span className="text-xl font-semibold">{content.appName}</span>
    </motion.div>
  );
}
