import { motion } from "framer-motion";
import { useAppSelector } from "@/hooks/redux";
import { selectAuthError } from "@/store/slices/auth/auth-selectors";
import { cn } from "@/lib/utils";

export function AuthErrorAlert({ className }) {
  const error = useAppSelector(selectAuthError);

  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "mb-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <span className="font-semibold">Error:</span>
        <span>{error}</span>
      </div>
    </motion.div>
  );
}

