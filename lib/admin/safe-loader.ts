/**
 * Hilfen für defensiv-robuste Admin-Loader. Verhindern, dass eine
 * einzelne Bad-Data-Zeile (z.B. unerwartet null oder ein Array-Join
 * statt Object) die ganze Listen-Page mit Application-Error crasht.
 */

/**
 * Liest ein Titel-aehnliches Feld aus einer Supabase-Join-Antwort.
 * Supabase liefert FK-Joins mal als Objekt, mal als Array (je nach
 * Inferenz). Diese Funktion akzeptiert beides und gibt sonst null.
 */
export function joinFeld<K extends string>(
  j: unknown,
  key: K,
): string | null {
  if (!j) return null;
  if (Array.isArray(j)) {
    const first = j[0];
    if (
      first &&
      typeof first === "object" &&
      key in first &&
      typeof (first as Record<string, unknown>)[key] === "string"
    ) {
      return (first as Record<string, string>)[key];
    }
    return null;
  }
  if (typeof j === "object" && key in j) {
    const v = (j as Record<string, unknown>)[key];
    return typeof v === "string" ? v : null;
  }
  return null;
}

/**
 * Verkuerzung für joinFeld(j, "title").
 */
export function joinTitel(j: unknown): string | null {
  return joinFeld(j, "title");
}

/**
 * Verkuerzung für joinFeld(j, "full_name").
 */
export function joinName(j: unknown): string | null {
  return joinFeld(j, "full_name");
}

/**
 * Garantiert ein Array zurueck, auch wenn Supabase null oder einen
 * unerwarteten Wert geliefert hat.
 */
export function alsArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

/**
 * KRITISCH: Erkennt Next.js-interne Control-Flow-Fehler, die
 * NICHT verschluckt werden duerfen.
 *
 * - redirect() throwt mit digest beginnend mit "NEXT_REDIRECT"
 * - notFound() throwt mit digest beginnend mit "NEXT_NOT_FOUND"
 * - cookies()/headers() in moeglichem Static-Render-Pfad throwen
 *   mit digest "DYNAMIC_SERVER_USAGE"
 *
 * Wenn ein try/catch in einem Loader diese Errors verschluckt,
 * funktioniert die Seite zur Laufzeit nicht mehr -- daher MUSS
 * jeder defensive Loader sie re-throwen.
 */
export function istNextJsControlFlow(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const digest = (e as { digest?: unknown }).digest;
  if (typeof digest !== "string") return false;
  return (
    digest === "DYNAMIC_SERVER_USAGE" ||
    digest.startsWith("NEXT_REDIRECT") ||
    digest.startsWith("NEXT_NOT_FOUND") ||
    digest.startsWith("BAILOUT_TO_CLIENT_SIDE_RENDERING")
  );
}

/**
 * Wrapper für alle defensiven Loader: faengt nur "echte" Fehler ab,
 * laesst Next.js-interne Errors (redirect, notFound, dynamic-usage)
 * durch.
 *
 * @example
 *   return safeLoad(async () => {
 *     const supabase = await createClient();
 *     ...
 *     return rows.map(map);
 *   }, []);
 */
export async function safeLoad<T>(
  fn: () => Promise<T>,
  fallback: T,
  label = "loader",
): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error(`[${label}] unexpected error:`, e);
    return fallback;
  }
}
