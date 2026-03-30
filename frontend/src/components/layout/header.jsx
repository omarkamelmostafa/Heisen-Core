// frontend/src/components/layout/header.jsx
"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { PrivateHeader } from "./private-header";
import { PublicHeader } from "./public-header";
import { useUserProfile } from "@/features/user/hooks/useUserProfile";

/**
 * Auth-aware header coordinator.
 *
 * Infrastructure component (exception to Rule F1) — intentionally accesses
 * Redux state directly to determine which header to render.
 *
 * Behavior:
 * - Before bootstrap completes: renders null (prevents UI flicker)
 * - After bootstrap, authenticated: renders PrivateHeader with user data
 * - After bootstrap, not authenticated: renders PublicHeader
 */
export function Header() {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, isBootstrapComplete } = useSelector(
    (state) => state.auth
  );

  // Prevent hydration mismatch by deferring render until client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // During bootstrap or before mount, do not render any header to prevent UI flicker.
  if (!mounted || !isBootstrapComplete) {
    return null;
  }

  // After bootstrap completes, render based on auth state
  if (isAuthenticated) {
    return <AuthenticatedHeader />;
  }

  return <PublicHeader />;
}

/**
 * Internal wrapper that calls useUserProfile hook.
 * Separated to avoid hook call when user is not authenticated.
 */
function AuthenticatedHeader() {
  const { initials, displayName, handleLogout, avatar } = useUserProfile();

  return (
    <PrivateHeader
      initials={initials}
      displayName={displayName}
      onLogout={handleLogout}
      avatarUrl={avatar?.url}
    />
  );
}
