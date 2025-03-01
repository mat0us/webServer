import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HydroLeaf",
  description: "Smart hydroponics monitoring system",
  manifest: "/manifest.json",
  themeColor: "#22c55e",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  icons: {
    icon: [{ url: "/icons/logo.svg" }, { url: "/icons/favicon.ico" }],
    apple: [{ url: "/icons/logo.svg" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "HydroLeaf",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/icons/logo.svg" />
        <link rel="apple-touch-icon" href="/icons/logo.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
