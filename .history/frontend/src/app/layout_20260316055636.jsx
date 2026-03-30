import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { ExtensionErrorHandler } from "@/components/utils/error-handler";
import { StoreProvider } from "@/providers/store-provider";
import ErrorBoundary from "@/components/shared/error-boundary";
import { AuthBootstrap } from "@/features/auth/components/auth-bootstrap";
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
    template: "%s | Fantasy Coach",
    default: "Fantasy Coach | Professional Sports Strategy",
  },
  description: "Master sports strategy with Fantasy Coach. Advanced analytics and team management tools for professional fantasy leagues.",
  keywords: ["fantasy sports", "sports analytics", "team management", "sports strategy", "fantasy coach"],
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
    <html lang="en">
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
        suppressHydrationWarning
      >
        <StoreProvider>
          <AuthBootstrap>
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </AuthBootstrap>
        </StoreProvider>
        <Toaster
          position="top-center"
          richColors
          closeButton
          duration={4000}
          visibleToasts={3}
          toastOptions={{
            className: "font-sans text-sm",
          }}
        />
      </body>
    </html>
  );
}
