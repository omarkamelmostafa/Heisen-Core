// frontend/src/app/(app)/page.jsx
"use client";

import { useUserProfile } from "@/features/user/hooks/useUserProfile";
import { DashboardContent } from "@/features/user/components/dashboard-content";

export default function DashboardPage() {
  const { firstName, email } = useUserProfile();

  return (
    <DashboardContent
      firstName={firstName}
      email={email}
    />
  );
}
