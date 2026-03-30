// frontend/src/components/auth/verify-email/resend-code-section.jsx
import { Button } from "@/components/ui/button";
import { verifyEmailContent as content } from "@/lib/config/auth/verify-email";

export function ResendCodeSection({ timeLeft, formatTime, onResendCode }) {
  const content = useVerifyEmailContent();

  const buttonText =
    timeLeft > 0
      ? content.resend.countdown.replace("{time}", formatTime(timeLeft))
      : content.resend.button;

  return (
    <div className="text-center space-y-3">
      <p className="text-sm text-muted-foreground">{content.resend.prompt}</p>
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
