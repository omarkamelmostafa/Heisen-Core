import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");
  const authT = useTranslations("Auth");

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="mx-auto flex h-full max-w-6xl flex-col px-6 pb-16 pt-10 sm:px-8 lg:px-12 lg:pt-16">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-wide text-primary/80">
                Fantasy Coach
              </span>
              <span className="text-xs text-slate-400">
                Next‑gen fantasy team management
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="hidden text-slate-300 transition hover:text-white sm:inline"
            >
              {authT("login")}
            </Link>
            <Button asChild variant="default" size="sm">
              <Link href="/signup">{authT("signup")}</Link>
            </Button>
          </nav>
        </header>

        {/* Hero */}
        <section className="mt-16 grid flex-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center">
          <div className="space-y-8">
            <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              {t("coach")}
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                {t("fantasySquad")}
              </span>
              {t("pro")}
            </h1>
            <p className="max-w-xl text-balance text-sm text-slate-300 sm:text-base">
              {t("heroDescription")}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Button asChild size="lg">
                <Link href="/login">{t("signIn")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/signup">{t("createAccount")}</Link>
              </Button>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400 sm:text-sm">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {t("liveAuth")}
              </div>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                {t("secureReset")}
              </div>
            </div>
          </div>

          {/* Right panel / visual */}
          <div className="relative hidden h-[340px] rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-950 shadow-[0_0_40px_rgba(15,23,42,0.8)] p-6 sm:h-[380px] lg:block">
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(45,212,191,0.18),transparent_55%),_radial-gradient(circle_at_bottom,_rgba(59,130,246,0.17),transparent_55%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  Authentication overview
                </p>
                <p className="max-w-xs text-sm text-slate-300">
                  Login, signup, email verification, and password reset flows
                  are fully wired to your API and ready for production.
                </p>
              </div>

              <div className="grid gap-3 text-xs text-slate-200">
                <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2">
                  <span>{authT("login")}</span>
                  <span className="text-emerald-300">{authT("connected")}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-2">
                  <span>{authT("signup")}</span>
                  <span className="text-cyan-300">{authT("connected")}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-sky-500/30 bg-sky-500/5 px-3 py-2">
                  <span>Email verification</span>
                  <span className="text-sky-300">{authT("connected")}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-500/5 px-3 py-2">
                  <span>Password reset</span>
                  <span className="text-indigo-300">{authT("connected")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/70 pt-4 text-xs text-slate-500 sm:text-sm">
          <span>{t("copyright", { year: new Date().getFullYear() })}</span>
          <div className="flex gap-4">
            <span>Auth system: login · signup · verify · reset</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
