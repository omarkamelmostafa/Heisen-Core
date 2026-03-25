// frontend/src/features/auth/components/guards/public-guard.jsx
"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";

export function PublicGuard({ children }) {
  const { isAuthenticated, isBootstrapComplete } = useSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isBootstrapComplete && isAuthenticated) {
      router.push("/");
    }
  }, [isBootstrapComplete, isAuthenticated, router]);

  if (!isBootstrapComplete) {
    return null;
  }

  if (!isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}
