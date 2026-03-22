"use client"

import * as React from "react"
import { SETTINGS_NAV_ITEMS } from "../config/settings-nav-items"

export function SettingsMobileNav({ activeId = "profile", onItemClick }) {
  return (
    <div className="lg:hidden mb-4 bg-card rounded-xl border border-border shadow-sm">
      <div className="flex overflow-x-auto p-1.5 gap-1 no-scrollbar">
        {SETTINGS_NAV_ITEMS.map((item) => {
          const isActive = item.id === activeId && !item.disabled;
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <button
                key={item.id}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-muted-foreground text-[13px] font-medium whitespace-nowrap shrink-0 cursor-not-allowed opacity-50 transition-colors"
                disabled
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
                <span className="text-[9px] ml-0.5 opacity-70">(Soon)</span>
              </button>
            );
          }

          if (isActive) {
            return (
              <button
                key={item.id}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors bg-primary text-primary-foreground"
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground text-[13px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  )
}
