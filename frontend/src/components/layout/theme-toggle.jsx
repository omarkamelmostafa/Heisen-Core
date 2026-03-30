// frontend/src/components/layout/theme-toggle.jsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useTranslations } from "next-intl"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check } from "lucide-react"

const themes = [
  { value: "light", labelKey: "theme.light", icon: Sun },
  { value: "dark", labelKey: "theme.dark", icon: Moon },
]

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const tc = useTranslations("common")
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = theme || "light"
  const currentThemeData = themes.find((t) => t.value === currentTheme) || themes[0]
  const CurrentIcon = currentThemeData.icon

  if (!mounted) {
    return (
      <button
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground"
        aria-label={tc("toggleTheme")}
      >
        <Sun className="h-5 w-5" />
      </button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={tc("toggleTheme")}
        >
          <CurrentIcon className="h-5 w-5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {themes.map((t) => {
          const Icon = t.icon
          const isActive = currentTheme === t.value
          return (
            <DropdownMenuItem
              key={t.value}
              onClick={() => setTheme(t.value)}
              className="flex items-center justify-between gap-2 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span>{tc(t.labelKey)}</span>
              </div>
              {isActive && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
