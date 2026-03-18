"use client";

import { useUserProfile } from "@/features/user/hooks/useUserProfile";
import { UserProfileCard } from "@/features/user/components/user-profile-card";
import { ProtectedGuard } from "@/features/auth/components/guards/protected-guard";

export default function DashboardPage() {
  const { user, handleLogout, initials, memberSince } = useUserProfile();

  return (
    <ProtectedGuard>
      <UserProfileCard
        user={user}
        handleLogout={handleLogout}
        initials={initials}
        memberSince={memberSince}
      />
    </ProtectedGuard>
  );
}
