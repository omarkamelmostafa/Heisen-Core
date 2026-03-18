import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function AuthErrorAlert({ className, error }) {
  if (!error) return null;

  return (
    <div
      className={cn(
        "mb-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 animate-in fade-in slide-in-from-top-2",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <span className="font-semibold">Error:</span>
        <span>{error}</span>
      </div>
    </div>
  );
}

