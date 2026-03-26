// frontend/src/features/auth/components/guards/protected-guard.jsx
"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppSplashScreen } from "@/components/shared/app-splash-screen";

export function ProtectedGuard({ children }) {
  const { isAuthenticated, isBootstrapComplete } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isBootstrapComplete && !isAuthenticated) {
      router.push("/login");
    }
  }, [isBootstrapComplete, isAuthenticated, router]);

  if (!isBootstrapComplete) {
    return <AppSplashScreen message="Verifying your session..." />;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}
