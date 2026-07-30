import "./globals.css";
import "./native-ui.css";
import { ThemeProvider } from "@/lib/theme";

export const metadata = {
  title: "iPlug Hub — Find Your Plug",
  description:
    "iPlug Hub is Nigeria's hyperlocal marketplace. Find services, shops, and places near you. Chat, negotiate, and connect — like a real Nigerian market, but digital.",
  keywords: [
    "iPlug Hub",
    "iPlug",
    "Nigeria marketplace",
    "find services near me",
    "artisan Nigeria",
    "local shops",
    "electrician near me",
    "plumber Nigeria",
  ],
  openGraph: {
    title: "iPlug Hub — Find Your Plug",
    description:
      "Nigeria's hyperlocal marketplace. Find services, shops, and places near you.",
    type: "website",
    locale: "en_NG",
  },
  appleWebApp: {
    capable: true,
    title: "iPlug Hub",
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0A0E27" },
  ],
};

import { ToastProvider } from '@/components/ui/ToastProvider';
import PostHogProvider from '@/components/analytics/PostHogProvider';
import PwaInstallPrompt from '@/components/layout/PwaInstallPrompt';
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/next';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <PostHogProvider>
              {children}
              <PwaInstallPrompt />
            </PostHogProvider>
          </ToastProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}

/**
 * Inline script to set theme before paint — prevents flash of wrong theme.
 * Reads from localStorage, falls back to system preference.
 */
function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('iplug-theme');
        if (!theme) {
          theme = 'dark';
        }
        document.documentElement.setAttribute('data-theme', theme);
      } catch(e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
