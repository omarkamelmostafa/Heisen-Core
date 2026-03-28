// frontend/src/app/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ExtensionErrorHandler } from "@/components/utils/error-handler";
import { StoreProvider } from "@/providers/store-provider";
import ErrorBoundary from "@/components/shared/error-boundary";
import { AuthBootstrap } from "@/features/auth/components/auth-bootstrap";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { BRAND } from "@/lib/config/brand-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata = {
  title: {
    template: `%s | ${BRAND.APP_NAME}`,
    default: BRAND.APP_NAME,
  },
  description: `${BRAND.APP_NAME} — ${BRAND.APP_DESCRIPTION}`,
  keywords: [BRAND.APP_NAME.toLowerCase(), "starter kit", "secure", "full-stack"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  manifest: "/manifest.json",
  icons: {
    icon: "/football-svgrepo-com.svg", // Placeholder
    shortcut: "/football-svgrepo-com.svg",
    apple: "/football-svgrepo-com.svg",
  },
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover"
        />
      </head>
      {/* Initialize in your root layout */}
      {ExtensionErrorHandler.init()}
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cairo.variable} bg-background text-foreground antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <StoreProvider>
              <AuthBootstrap>
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </AuthBootstrap>
            </StoreProvider>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
