// frontend/src/features/auth/components/verify-email/timer-display.jsx
import { Clock } from "lucide-react";
import { useTranslations } from "next-intl";

export function TimerDisplay({ timeLeft, formatTime }) {
  const t = useTranslations("auth.verifyEmail");

  return (
    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4" />
      <span>
        {t("timer.resendAvailableIn")} {formatTime(timeLeft)}
      </span>
    </div>
  );
}
