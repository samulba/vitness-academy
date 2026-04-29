/**
 * Inline-Skript, das vor React laeuft und die richtige Theme-Klasse
 * an <html> haengt -- so gibt es kein Theme-Flash beim Laden.
 *
 * Liest theme aus localStorage; faellt auf System-Praeferenz zurueck.
 */
const SCRIPT = `(() => {
  try {
    const stored = localStorage.getItem('vitness-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const useDark = stored === 'dark' || (!stored && prefersDark);
    if (useDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (_) {}
})();`;

export function ThemeScript() {
  return (
    <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />
  );
}
