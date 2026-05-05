/**
 * Client-safe Types für Mitarbeiter-Notizen.
 */

export type Notiz = {
  id: string;
  mitarbeiter_id: string;
  autor_id: string | null;
  autor_name: string | null;
  autor_avatar_path: string | null;
  body: string;
  created_at: string;
};
