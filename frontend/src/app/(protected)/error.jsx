// frontend/src/app/(app)/error.jsx
"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }) {
  const t = useTranslations("errors");
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="flex min-h-[100vh] items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full text-center space-y-6 bg-card p-8 rounded-xl border border-border/50 shadow-sm">
        <div className="flex justify-center">
          <div className="bg-destructive/10 rounded-full p-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            {t("somethingWentWrong")}
          </h2>
          {isDev && error?.message ? (
            <div className="mt-4 p-3 bg-muted/50 rounded-md text-left overflow-auto max-h-32">
              <p className="text-sm text-destructive font-mono">
                {error.message}
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground">
              {t("appError")}
            </p>
          )}
        </div>

        <div className="space-y-3 pt-4">
          <Button onClick={() => reset()} className="w-full" size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("tryAgain")}
          </Button>

          <Button variant="outline" asChild className="w-full">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              {t("goToDashboard")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
