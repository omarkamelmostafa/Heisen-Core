// frontend/src/features/auth/components/forgot-password/troubleshooting-tips.jsx
import { forgotPasswordContent as content } from "@/lib/config/auth/forgot-password";

export function TroubleshootingTips() {

  return (
    <div className="bg-muted rounded-lg p-4 text-sm">
      <p className="font-medium text-foreground">
        {content.success.tips.title}
      </p>
      <ul className="mt-2 space-y-1 text-muted-foreground">
        {content.success.tips.items.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
