/**
 * Standalone-Layout fuer die Zertifikate-Druckseite.
 * Keine Sidebar, keine Topbar, eigenes Body-Styling.
 */
export default function ZertifikatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
