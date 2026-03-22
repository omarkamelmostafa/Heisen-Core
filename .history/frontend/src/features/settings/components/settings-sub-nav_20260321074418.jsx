"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettingsNav } from "@/features/settings/hooks/useSettingsNav";
import { Badge } from "@/components/ui/badge";

export function SettingsSubNav() {
  const pathname = usePathname();
  const { navItems } = useSettingsNav();

  return (
    <aside className="hidden md:block w-[220px] shrink-0 border-r border-border p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your account settings
        </p>
      </div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (!item.enabled) {
            return (
              <div
                key={item.href}
                className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-muted-foreground/60 cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0">
                  Soon
                </Badge>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-2 rounded-r-md text-sm font-medium transition-colors border-l-2 ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
