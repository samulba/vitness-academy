import type { Metadata } from "next";
import "./globals.css";
import { ThemeScript } from "@/components/ThemeScript";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Vitness Academy",
  description:
    "Interne Schulungsplattform für Fitnessstudio-Mitarbeiter mit Lernpfaden, Quizzen, Praxisfreigaben und Handbuch.",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
