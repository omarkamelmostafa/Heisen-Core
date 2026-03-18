// frontend/src/components/auth/login/divider.jsx
import { motion } from "framer-motion";
import { loginContent } from "@/lib/config/auth/login";
import { signupContent } from "@/lib/config/auth/signup";

export function Divider({ variants, text, context = "login" }) {
  const content = context === "signup" ? signupContent : loginContent;
  const dividerText = text || content.divider.text;

  return (
    <motion.div variants={variants} className="flex items-center gap-4">
      <div className="bg-border h-px flex-1" />
      <p className="text-muted-foreground text-sm whitespace-nowrap">
        {dividerText}
      </p>
      <div className="bg-border h-px flex-1" />
    </motion.div>
  );
}
