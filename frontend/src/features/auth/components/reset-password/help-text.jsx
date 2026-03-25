// frontend/src/features/auth/components/reset-password/help-text.jsx
import { resetPasswordContent as content } from "@/lib/config/auth/reset-password";

export function HelpText() {

  return (
    <div className="text-center text-sm text-muted-foreground">
      <p>{content.helpText.content}</p>
    </div>
  );
}
