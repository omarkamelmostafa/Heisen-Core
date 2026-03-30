// frontend/src/features/auth/components/verify-email/resend-code-section.jsx
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function ResendCodeSection({ timeLeft, formatTime, onResendCode }) {
  const t = useTranslations("auth.verifyEmail");

  const buttonText =
    timeLeft > 0
      ? t("resend.countdown", { time: formatTime(timeLeft) })
      : t("resend.button");

  return (
    <div className="text-center space-y-3">
      <p className="text-sm text-muted-foreground">{t("resend.prompt")}</p>
      <Button
        variant="outline"
        onClick={onResendCode}
        disabled={timeLeft > 0}
        className="w-full"
      >
        {buttonText}
      </Button>
    </div>
  );
}
