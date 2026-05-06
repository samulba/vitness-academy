import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Suspense } from "react";
import { ThemeScript } from "@/components/ThemeScript";
import { Toaster } from "@/components/ui/toast";
import { ToastFlash } from "@/components/ui/toast-flash";
import { ShortcutsHelp } from "@/components/help/ShortcutsHelp";

export const metadata: Metadata = {
  title: "Vitness Crew",
  description:
    "Interne Plattform für Vitness-Studio-Mitarbeiter — Onboarding, Lernpfade, Aufgaben, Mängel, Anfragen und Verwaltung an einem Ort.",
  manifest: "/manifest.json",
  applicationName: "Vitness Crew",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Vitness Crew",
  },
};

export const viewport: Viewport = {
  themeColor: "#b50f5f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[hsl(var(--primary))] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[hsl(var(--primary-foreground))] focus:shadow-lg"
        >
          Zum Hauptinhalt springen
        </a>
        {children}
        <Toaster />
        <ShortcutsHelp />
        <Suspense fallback={null}>
          <ToastFlash />
        </Suspense>
      </body>
    </html>
  );
}
