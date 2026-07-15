import "./globals.css";
import { ThemeProvider } from "@/lib/theme";

export const metadata = {
  title: "iPlugg — Find Your Plug",
  description:
    "iPlugg is Nigeria's hyperlocal marketplace. Find services, shops, and places near you. Chat, negotiate, and connect — like a real Nigerian market, but digital.",
  keywords: [
    "iPlugg",
    "Nigeria marketplace",
    "find services near me",
    "artisan Nigeria",
    "local shops",
    "electrician near me",
    "plumber Nigeria",
  ],
  openGraph: {
    title: "iPlugg — Find Your Plug",
    description:
      "Nigeria's hyperlocal marketplace. Find services, shops, and places near you.",
    type: "website",
    locale: "en_NG",
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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
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
          theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        document.documentElement.setAttribute('data-theme', theme);
      } catch(e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
