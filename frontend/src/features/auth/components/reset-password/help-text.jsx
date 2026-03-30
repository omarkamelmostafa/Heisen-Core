// frontend/src/features/auth/components/reset-password/help-text.jsx
import { useTranslations } from "next-intl";

export function HelpText() {
  const t = useTranslations("auth.resetPassword");

  return (
    <div className="text-center text-sm text-muted-foreground">
      <p>{t("helpText")}</p>
    </div>
  );
}
