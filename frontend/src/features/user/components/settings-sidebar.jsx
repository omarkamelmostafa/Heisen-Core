"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { SETTINGS_NAV_ITEMS } from "../config/settings-nav-items"

export function SettingsSidebar({ activeId = "profile", onItemClick }) {
  return (
    <aside className="shrink-0 w-[220px] bg-card rounded-xl border border-border p-4 shadow-sm hidden lg:block sticky top-[89px] max-h-[calc(100vh-117px)] overflow-y-auto">
      <div className="px-2.5 pb-3 border-b border-border mb-2.5">
        <h2 className="text-[15px] font-semibold text-foreground">Settings</h2>
        <p className="text-xs text-muted-foreground mt-0.5">You can find all settings here.</p>
      </div>

      <nav>
        <ul className="flex flex-col gap-0.5">
          {SETTINGS_NAV_ITEMS.map((item) => {
            const isActive = item.id === activeId && !item.disabled;
            const Icon = item.icon;

            return (
              <li key={item.id}>
                {isActive ? (
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-primary text-primary-foreground text-[13.5px] font-medium cursor-pointer">
                    <Icon className="h-[15px] w-[15px] shrink-0" />
                    <span>{item.label}</span>
                  </div>
                ) : item.disabled ? (
                  <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-muted-foreground text-[13.5px] font-medium cursor-not-allowed opacity-60">
                    <Icon className="h-[15px] w-[15px] shrink-0" />
                    <span>{item.label}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 font-normal">Soon</Badge>
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground text-[13.5px] font-medium cursor-pointer transition-colors"
                    onClick={() => onItemClick(item.id)}
                  >
                    <Icon className="h-[15px] w-[15px] shrink-0" />
                    <span>{item.label}</span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  )
}
