/**
 * Client-safe Types und Helpers für Notifications. Hat KEINE
 * Supabase-Imports und kann von Client-Components genutzt werden.
 *
 * Server-Loaders (ladeNotifications, ungeleseneAnzahl) liegen in
 * lib/notifications.ts.
 */

export type NotificationType =
  | "mangel_status"
  | "submission_status"
  | "submission_neu"
  | "praxis_decision"
  | "aufgabe_neu"
  | "info_neu"
  | "lektion_q_antwort"
  | "kudos"
  | "cleaning_protocol_submitted";

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

const TYP_ICON: Record<NotificationType, string> = {
  mangel_status: "wrench",
  submission_status: "file-text",
  submission_neu: "inbox",
  praxis_decision: "check-square",
  aufgabe_neu: "list-todo",
  info_neu: "megaphone",
  lektion_q_antwort: "message-circle",
  kudos: "heart",
  cleaning_protocol_submitted: "sparkles",
};

export function iconKey(type: NotificationType): string {
  return TYP_ICON[type] ?? "bell";
}

export function relativeZeit(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min`;
  const std = Math.floor(min / 60);
  if (std < 24) return `vor ${std} Std`;
  const tage = Math.floor(std / 24);
  if (tage < 7) return `vor ${tage} Tg`;
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
