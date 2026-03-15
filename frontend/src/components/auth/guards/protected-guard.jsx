"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";

export function ProtectedGuard({ children }) {
  const { isAuthenticated, isBootstrapComplete } = useSelector((state) => state.auth);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isBootstrapComplete && !isAuthenticated) {
      router.push(`/login?returnTo=${encodeURIComponent(pathname)}`);
    }
  }, [isBootstrapComplete, isAuthenticated, router, pathname]);

  if (!isBootstrapComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen grow">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return null;
}
