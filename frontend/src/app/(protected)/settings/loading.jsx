// frontend/src/app/(app)/settings/loading.jsx
import { AppSplashScreen } from "@/components/shared/app-splash-screen";
import { getTranslations } from "next-intl/server";

export default async function SettingsLoading() {
  const t = await getTranslations("infrastructure");
  return <AppSplashScreen message={t("loading")} />;
}
