// frontend/src/app/(app)/settings/layout.jsx
"use client";

import { usePathname } from "next/navigation";
import { SettingsSidebar } from "@/features/user/components/settings-sidebar";
import { SettingsMobileNav } from "@/features/user/components/settings-mobile-nav";

export default function SettingsLayout({ children }) {
  const pathname = usePathname();

  const getActiveSection = () => {
    if (pathname.includes("/settings/security")) return "security";
    return "profile";
  };

  return (
    <>
      <SettingsMobileNav activeId={getActiveSection()} />
      <div className="flex items-start gap-5">
        <aside>
          <SettingsSidebar activeId={getActiveSection()} />
        </aside>
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </>
  );
}
