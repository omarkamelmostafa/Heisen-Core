"use client";
// frontend/src/components/shared/language-toggle.jsx

import * as React from "react";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Languages, Check, ChevronDown } from "lucide-react";
import { LOCALE_NAMES } from "@/i18n/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const AVAILABLE_LOCALES = ["en", "ar"];

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (nextLocale) => {
    if (nextLocale === locale) return;
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Lax`;
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={isPending}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-50"
        >
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{LOCALE_NAMES[locale]}</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {AVAILABLE_LOCALES.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className="flex items-center justify-between gap-2 cursor-pointer"
          >
            <span>{LOCALE_NAMES[loc]}</span>
            {locale === loc && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
