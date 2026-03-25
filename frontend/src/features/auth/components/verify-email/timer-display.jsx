// frontend/src/features/auth/components/verify-email/timer-display.jsx
import { Clock } from "lucide-react";
import { verifyEmailContent as content } from "@/lib/config/auth/verify-email";

export function TimerDisplay({ timeLeft, formatTime }) {

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>
        Resend available in {formatTime(timeLeft)}
      </span>
    </div>
  );
}
