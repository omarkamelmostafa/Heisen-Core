"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { User, Shield, Settings } from "lucide-react";

export function DashboardContent({ firstName, email }) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const quickLinks = [
    {
      title: t("profileSettings"),
      description: t("profileSettingsDesc"),
      href: "/settings/profile",
      icon: User,
    },
    {
      title: t("security"),
      description: t("securityDesc"),
      href: "/settings/security",
      icon: Shield,
    },
    {
      title: t("preferences"),
      description: t("preferencesDesc"),
      href: "/settings/profile",
      icon: Settings,
      comingSoon: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {firstName ? t("welcomeWithName", { firstName }) : t("welcomeGeneric")}
        </h1>
        <p className="mt-1 text-muted-foreground">
          {t("overview")}
        </p>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.title}
              href={link.href}
              className={`group relative rounded-lg border border-border p-6 transition-colors hover:border-primary/50 hover:bg-accent/50 ${link.comingSoon ? "pointer-events-none opacity-60" : ""
                }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="flex size-10 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                {link.comingSoon && (
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {tc("soon")}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {link.title}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {link.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          {t("recentActivity")}
        </h2>
        <div className="rounded-lg border border-border p-8 text-center">
          <p className="text-muted-foreground">
            {t("activityComingSoon")}
          </p>
        </div>
      </div>
    </div>
  );
}
