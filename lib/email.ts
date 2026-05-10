import { Resend } from "resend";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";

/**
 * Resend-Wrapper für alle Custom-Mails der App.
 *
 * Auth-Mails (Magic-Link, Passwort-Reset, Confirm) gehen separat über
 * Supabase-Auth-SMTP — ist im Supabase Dashboard konfiguriert. Diese
 * lib/email.ts ist nur für code-getriebene Custom-Mails wie Welcome-
 * Mail oder Lohnabrechnung-Notification.
 *
 * ENV-Variablen:
 *   RESEND_API_KEY      — API-Key aus dem Resend-Dashboard
 *   EMAIL_FROM          — z.B. "Vitness Crew <team@vitness-crew.de>"
 *   NEXT_PUBLIC_APP_URL — Basis-URL für Links in den Mails
 *                         (z.B. "https://www.vitness-crew.de")
 */

const FROM_DEFAULT = "Vitness Crew <team@vitness-crew.de>";

let _client: Resend | null = null;

function client(): Resend | null {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(
      "[email] RESEND_API_KEY fehlt — Mails werden NICHT versendet (no-op).",
    );
    return null;
  }
  _client = new Resend(key);
  return _client;
}

/**
 * Basis-URL der App. Nutzt NEXT_PUBLIC_APP_URL, fallback auf VERCEL_URL,
 * sonst leerer String — Aufrufer muss damit umgehen koennen.
 */
export function appUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (explicit) return explicit;
  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "";
}

export type EmailErgebnis =
  | { ok: true; id: string }
  | { ok: false; message: string };

/**
 * Sendet eine HTML-Mail via Resend. Bei fehlendem API-Key oder
 * Send-Error wird ein {ok:false}-Result zurueckgegeben — Aufrufer
 * darf NICHT crashen, weil eine Mail-Stoerung kein Hauptpfad-Problem
 * sein darf (z.B. Mitarbeiter-Anlegen muss auch ohne Mail durchlaufen).
 */
export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}): Promise<EmailErgebnis> {
  const c = client();
  if (!c) {
    return { ok: false, message: "Mail-Client nicht konfiguriert" };
  }
  try {
    const { data, error } = await c.emails.send({
      from: input.from ?? process.env.EMAIL_FROM ?? FROM_DEFAULT,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      ...(input.text ? { text: input.text } : {}),
      ...(input.replyTo ? { replyTo: input.replyTo } : {}),
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, message: error.message ?? "Resend-Fehler" };
    }
    if (!data?.id) {
      return { ok: false, message: "Resend lieferte keine ID zurueck" };
    }
    return { ok: true, id: data.id };
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    const msg = e instanceof Error ? e.message : "unbekannt";
    console.error("[email] sendEmail crashed:", e);
    return { ok: false, message: msg };
  }
}
