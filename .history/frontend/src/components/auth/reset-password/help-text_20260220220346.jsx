// frontend/src/components/auth/reset-password/help-text.jsx
import { resetPasswordContent as content } from "@/lib/config/auth/reset-password";

export function HelpText() {
  const content = useResetPasswordContent();

  return (
    <div className="text-center text-sm text-muted-foreground">
      <p>{content.helpText.content}</p>
    </div>
  );
}
