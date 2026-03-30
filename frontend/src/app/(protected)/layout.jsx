// frontend/src/app/(app)/layout.jsx
"use client";

import { ProtectedGuard } from "@/features/auth/components/guards/protected-guard";
import { PrivateHeader } from "@/components/layout/private-header";
import { useUserProfile } from "@/features/user/hooks/useUserProfile";

export default function AppLayout({ children }) {
  const { initials, displayName, handleLogout, avatar } = useUserProfile();

  return (
    <ProtectedGuard>
      <div className="min-h-screen bg-background">
        <header>
          <PrivateHeader
            initials={initials}
            displayName={displayName}
            onLogout={handleLogout}
            avatarUrl={avatar?.url}
          />
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ProtectedGuard>
  );
}
