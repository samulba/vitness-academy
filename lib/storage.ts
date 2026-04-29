/**
 * Liefert die public URL fuer einen Storage-Pfad im
 * lesson-images-Bucket. Falls der Bucket nicht public ist,
 * muss hier auf signed URLs umgestellt werden.
 */
export function bildUrlFuerPfad(
  pfad: string | null | undefined,
): string | null {
  if (!pfad) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/lesson-images/${pfad}`;
}
