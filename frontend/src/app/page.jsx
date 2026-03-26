// frontend/src/app/page.jsx
"use client";

import { ProtectedGuard } from "@/features/auth/components/guards/protected-guard";
import { TopNav } from "@/components/layout/top-nav";
import { useUserProfile } from "@/features/user/hooks/useUserProfile";
import { DashboardContent } from "@/features/user/components/dashboard-content";

export default function DashboardPage() {
  const {
    firstName,
    email,
    initials,
    displayName,
    handleLogout,
    avatar,
  } = useUserProfile();

  return (
    <ProtectedGuard>
      <div className="min-h-screen bg-background">
        <TopNav
          initials={initials}
          displayName={displayName}
          onLogout={handleLogout}
          avatarUrl={avatar?.url}
        />
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <DashboardContent
            firstName={firstName}
            email={email}
          />
        </div>
      </div>
    </ProtectedGuard>
  );
}
