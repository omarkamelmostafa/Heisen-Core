// frontend/src/app/layout.jsx
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ExtensionErrorHandler } from "@/components/utils/error-handler";
import { StoreProvider } from "@/providers/store-provider";
import ErrorBoundary from "@/components/shared/error-boundary";
import { AuthBootstrap } from "@/features/auth/components/auth-bootstrap";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    template: "%s | Heisen Core",
    default: "Heisen Core",
  },
  description: "Heisen Core — Your secure application platform.",
  keywords: ["heisen core", "dashboard", "settings", "security"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  manifest: "/manifest.json",
  icons: {
    icon: "/football-svgrepo-com.svg", // Placeholder
    shortcut: "/football-svgrepo-com.svg",
    apple: "/football-svgrepo-com.svg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
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
      </body>
    </html>
  );
}
