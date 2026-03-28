// frontend/src/features/auth/components/forgot-password/troubleshooting-tips.jsx
import { useTranslations } from "next-intl";

export function TroubleshootingTips() {
  const t = useTranslations("auth.forgotPassword");
  const tips = t.raw("success.tips");

  return (
    <div className="bg-muted rounded-lg p-4 text-sm">
      <p className="font-medium text-foreground">
        {t("success.tipsTitle")}
      </p>
      <ul className="mt-2 space-y-1 text-muted-foreground">
        {tips.map((item, index) => (
          <li key={index}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
