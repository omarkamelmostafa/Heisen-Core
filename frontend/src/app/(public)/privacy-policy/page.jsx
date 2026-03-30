// frontend/src/app/(public)/privacy-policy/page.jsx
"use client";

import { useAppSelector } from "@/hooks/redux";
import { AppSplashScreen } from "@/components/shared/app-splash-screen";
import { useTranslations } from "next-intl";

export default function PrivacyPolicyPage() {
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
            {t("privacy.title")}
          </h1>

          <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {t("privacy.lastUpdated")}: {new Date().toLocaleDateString()}
            </p>

            <p className="text-muted-foreground leading-relaxed mt-4">
              {t("privacy.intro")}
            </p>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("privacy.sections.informationCollection.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy.sections.informationCollection.content")}
              </p>
              <ul className="mt-4 list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("privacy.sections.informationCollection.items.personal")}</li>
                <li>{t("privacy.sections.informationCollection.items.usage")}</li>
                <li>{t("privacy.sections.informationCollection.items.cookies")}</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("privacy.sections.useOfInformation.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy.sections.useOfInformation.content")}
              </p>
              <ul className="mt-4 list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("privacy.sections.useOfInformation.items.provision")}</li>
                <li>{t("privacy.sections.useOfInformation.items.improvement")}</li>
                <li>{t("privacy.sections.useOfInformation.items.communication")}</li>
                <li>{t("privacy.sections.useOfInformation.items.security")}</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("privacy.sections.dataSharing.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy.sections.dataSharing.content")}
              </p>
              <ul className="mt-4 list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("privacy.sections.dataSharing.items.serviceProviders")}</li>
                <li>{t("privacy.sections.dataSharing.items.legal")}</li>
                <li>{t("privacy.sections.dataSharing.items.consent")}</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("privacy.sections.dataSecurity.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy.sections.dataSecurity.content")}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("privacy.sections.userRights.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy.sections.userRights.content")}
              </p>
              <ul className="mt-4 list-disc list-inside text-muted-foreground space-y-2">
                <li>{t("privacy.sections.userRights.items.access")}</li>
                <li>{t("privacy.sections.userRights.items.rectification")}</li>
                <li>{t("privacy.sections.userRights.items.deletion")}</li>
                <li>{t("privacy.sections.userRights.items.portability")}</li>
              </ul>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("privacy.sections.cookies.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy.sections.cookies.content")}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("privacy.sections.childrenPrivacy.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy.sections.childrenPrivacy.content")}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("privacy.sections.changes.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy.sections.changes.content")}
              </p>
            </section>

            <section className="mt-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mt-8 mb-4">
                {t("privacy.sections.contact.title")}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t("privacy.sections.contact.content")}
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
