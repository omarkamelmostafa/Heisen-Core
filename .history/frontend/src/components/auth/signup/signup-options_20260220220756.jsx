// frontend/src/components/auth/signup/signup-options.jsx
import { motion } from "framer-motion";
import Link from "next/link";
import { quickFadeInVariants } from "@/lib/animations/auth/authAnimations";
import { signupContent as content } from "@/lib/config/auth/signup";

export function SignupOptions() {
  const content = useSignupContent();

  return (
    <motion.p
      initial="hidden"
      animate="visible"
      variants={quickFadeInVariants}
      className="text-muted-foreground text-center text-sm"
    >
      {content.options.existingAccount}{" "}
      <Link
        href="/login"
        className="text-foreground hover:underline font-medium"
      >
        {content.options.signInLink}
      </Link>
    </motion.p>
  );
}
