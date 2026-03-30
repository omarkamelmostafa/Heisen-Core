// frontend/src/components/layout/public-header.jsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BRAND } from "@/lib/config/brand-config"
import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { LanguageToggle } from "@/components/shared/language-toggle"
import { useTranslations } from "next-intl"
import { Menu, X } from "lucide-react"

export function PublicHeader() {
  const pathname = usePathname()
  const t = useTranslations("publicNav")
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  const isLoginPage = pathname === "/login"
  const isSignupPage = pathname === "/signup"

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center px-4 md:px-6">
        {/* Logo area */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Logo className="h-6 w-6" />
          <span className="text-sm font-semibold tracking-tight text-foreground hidden sm:inline">
            {BRAND.APP_NAME}
          </span>
        </Link>

        {/* Desktop Right actions */}
        <div className="ms-auto hidden md:flex items-center gap-2 md:gap-3 shrink-0">
          <LanguageToggle />
          <ThemeToggle />

          <div className="h-4 w-px bg-border mx-1" />

          <Button
            variant="ghost"
            size="sm"
            asChild
            disabled={isLoginPage}
            className={isLoginPage ? "pointer-events-none opacity-50" : ""}
          >
            <Link href="/login">{t("login")}</Link>
          </Button>

          <Button
            size="sm"
            asChild
            disabled={isSignupPage}
            className={isSignupPage ? "pointer-events-none opacity-50" : ""}
          >
            <Link href="/signup">{t("signup")}</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="ms-auto flex md:hidden items-center gap-2">
          <LanguageToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
            <div className="h-px bg-border" />
            <Button
              variant="ghost"
              size="sm"
              asChild
              disabled={isLoginPage}
              className={isLoginPage ? "pointer-events-none opacity-50 justify-start" : "justify-start"}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/login">{t("login")}</Link>
            </Button>
            <Button
              size="sm"
              asChild
              disabled={isSignupPage}
              className={isSignupPage ? "pointer-events-none opacity-50 justify-start" : "justify-start"}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Link href="/signup">{t("signup")}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
