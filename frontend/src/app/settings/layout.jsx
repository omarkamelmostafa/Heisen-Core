// frontend/src/app/settings/layout.jsx
"use client";

import { usePathname } from "next/navigation";
import { ProtectedGuard } from "@/features/auth/components/guards/protected-guard";
import { TopNav } from "@/components/layout/top-nav";
import { SettingsSidebar } from "@/features/user/components/settings-sidebar";
import { SettingsMobileNav } from "@/features/user/components/settings-mobile-nav";
import { useUserProfile } from "@/features/user/hooks/useUserProfile";

export default function SettingsLayout({ children }) {
  const pathname = usePathname();
  const { initials, displayName, handleLogout, avatar } = useUserProfile();

  // Derive active section from URL path
  const getActiveSection = () => {
    if (pathname.includes("/settings/security")) return "security";
    return "profile";
  };

  return (
    <ProtectedGuard>
      <div className="min-h-screen bg-muted">
        <TopNav
          initials={initials}
          displayName={displayName}
          onLogout={handleLogout}
          avatarUrl={avatar?.url}
        />
        <div className="w-full max-w-[1200px] mx-auto p-4 md:p-7">
          <SettingsMobileNav
            activeId={getActiveSection()}
          />
          <div className="flex items-start gap-5">
            <SettingsSidebar
              activeId={getActiveSection()}
            />
            <main className="flex-1 min-w-0">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedGuard>
  );
}
