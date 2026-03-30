// frontend/src/features/auth/components/signup/name-fields.jsx
"use client";

import { FormField } from "@/features/auth/components/forms/form-field";
import { useTranslations } from "next-intl";
import { User } from "lucide-react";

export function NameFields({ isLoading }) {
  const t = useTranslations("auth.signup");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField
        name="firstname"
        type="text"
        label={t("firstNameLabel")}
        placeholder={t("firstNamePlaceholder")}
        required
        disabled={isLoading}
        icon={User}
      />

      <FormField
        name="lastname"
        type="text"
        label={t("lastNameLabel")}
        placeholder={t("lastNamePlaceholder")}
        required
        disabled={isLoading}
        icon={User}
      />
    </div>
  );
}
