// frontend/src/app/layout.jsx

// import { ExtensionErrorHandler } from "@/components/utils/error-handler";

import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
import "@/app/globals.css";
import { ExtensionErrorHandler } from "@/components/utils/error-handler";
import { StoreProvider } from "@/providers/store-provider";

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
  openGraph: {
    title: "Fantasy Coach",
    description: "Professional Sports Strategy & Analytics",
    url: "https://fantasy-coach.com", // Example domain
    siteName: "Fantasy Coach",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fantasy Coach",
    description: "Professional Sports Strategy & Analytics",
    creator: "@fantasycoach",
  },
};

import ErrorBoundary from "@/components/shared/error-boundary";

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
        className="bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        <StoreProvider>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </StoreProvider>
      </body>
    </html>
  );
}
