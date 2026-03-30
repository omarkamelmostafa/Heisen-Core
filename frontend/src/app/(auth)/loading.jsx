// frontend/src/app/(auth)/loading.jsx
import { AppSplashScreen } from "@/components/shared/app-splash-screen";
import { getTranslations } from "next-intl/server";

export default async function AuthLoading() {
  const t = await getTranslations("infrastructure");
  return <AppSplashScreen message={t("preparing")} />;
}
