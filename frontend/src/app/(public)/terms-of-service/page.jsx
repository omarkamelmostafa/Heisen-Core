// frontend/src/app/(public)/terms-of-service/page.jsx
"use client";

import { useAppSelector } from "@/hooks/redux";
import { AppSplashScreen } from "@/components/shared/app-splash-screen";
import { useTranslations } from "next-intl";

export default function TermsOfServicePage() {
  const tInfra = useTranslations("infrastructure");
  const t = useTranslations("public");
  const isBootstrapComplete = useAppSelector((state) => state.auth.isBootstrapComplete);

  // Show splash screen during auth bootstrap to prevent navbar flicker
  if (!isBootstrapComplete) {
    return <AppSplashScreen message={tInfra("loading")} />;
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="min-h-[calc(100vh-3.5rem)] py-12 sm:py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8">
            {t("terms.title")}
          </h1>

          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {t("terms.lastUpdated")}: {new Date().toLocaleDateString()}
            </p>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("terms.sections.acceptance.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms.sections.acceptance.content")}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("terms.sections.account.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms.sections.account.content")}
              </p>
              <ul className="mt-4 list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("terms.sections.account.items.accurate")}</li>
                <li>{t("terms.sections.account.items.security")}</li>
                <li>{t("terms.sections.account.items.responsibility")}</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("terms.sections.serviceUsage.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms.sections.serviceUsage.content")}
              </p>
              <ul className="mt-4 list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("terms.sections.serviceUsage.items.lawful")}</li>
                <li>{t("terms.sections.serviceUsage.items.noHarm")}</li>
                <li>{t("terms.sections.serviceUsage.items.noAbuse")}</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("terms.sections.intellectualProperty.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms.sections.intellectualProperty.content")}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("terms.sections.termination.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms.sections.termination.content")}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("terms.sections.liability.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms.sections.liability.content")}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("terms.sections.changes.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms.sections.changes.content")}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("terms.sections.contact.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("terms.sections.contact.content")}
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
