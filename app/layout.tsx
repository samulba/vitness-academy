import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vitness Academy",
  description:
    "Interne Schulungsplattform für Fitnessstudio-Mitarbeiter mit Lernpfaden, Quizzen, Praxisfreigaben und Wissensdatenbank.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
