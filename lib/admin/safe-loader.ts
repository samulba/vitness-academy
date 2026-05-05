/**
 * Hilfen fuer defensiv-robuste Admin-Loader. Verhindern, dass eine
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
 * Verkuerzung fuer joinFeld(j, "title").
 */
export function joinTitel(j: unknown): string | null {
  return joinFeld(j, "title");
}

/**
 * Verkuerzung fuer joinFeld(j, "full_name").
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
