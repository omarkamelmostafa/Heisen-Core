"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Languages } from "lucide-react";
import { LOCALE_NAMES } from "@/i18n/config";

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nextLocale = locale === "en" ? "ar" : "en";

  const handleToggle = () => {
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
      title={`Switch to ${LOCALE_NAMES[nextLocale]}`}
    >
      <Languages className="h-4 w-4" />
      <span className="hidden sm:inline">{LOCALE_NAMES[nextLocale]}</span>
    </button>
  );
}
