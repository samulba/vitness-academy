import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { appUrl, sendEmail } from "@/lib/email";
import { reminderMail } from "@/lib/email-templates/reminder";

export const dynamic = "force-dynamic";

/**
 * Cron-Endpoint: schickt Reminder-Mails an alle Mitarbeiter die seit
 * mindestens 7 Tagen eingeladen sind aber noch nie eingeloggt waren.
 *
 * Wird via Vercel-Cron 1x taeglich getriggert (siehe vercel.json).
 *
 * Schutz: Authorization-Header mit "Bearer ${CRON_SECRET}". Vercel-
 * Cron sendet diesen Header automatisch wenn CRON_SECRET als Env-
 * Variable gesetzt ist.
 *
 * Mehrfach-Versendungs-Schutz: nach jeder Reminder-Mail wird in
 * auth.users.user_metadata.last_invite_reminder_at die ISO-Zeit
 * gespeichert. Beim naechsten Cron-Run werden User mit Reminder
 * < 7 Tage her ausgeschlossen.
 */
export async function GET(request: Request) {
  // 1) Auth-Check
  const expected = process.env.CRON_SECRET;
  if (!expected) {
    return NextResponse.json(
      { error: "CRON_SECRET nicht gesetzt — Endpoint deaktiviert" },
      { status: 503 },
    );
  }
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2) Alle Auth-Users laden, filtern nach Status "Eingeladen >7T"
  const admin = createAdminClient();
  const tageGrenzeMs = 7 * 24 * 60 * 60 * 1000;
  const jetzt = Date.now();

  type Kandidat = {
    id: string;
    email: string;
    invited_at: string;
    tageEingeladen: number;
    user_metadata: Record<string, unknown>;
  };
  const kandidaten: Kandidat[] = [];

  let page = 1;
  for (let i = 0; i < 5; i++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) {
      console.error("[cron/invite-reminder] listUsers:", error);
      return NextResponse.json(
        { error: "listUsers failed", detail: error.message },
        { status: 500 },
      );
    }
    for (const u of data.users ?? []) {
      if (!u.email) continue;
      if (u.last_sign_in_at) continue; // schon aktiv → kein Reminder
      if (!u.invited_at) continue; // nie eingeladen
      const invitedTs = new Date(u.invited_at).getTime();
      if (jetzt - invitedTs < tageGrenzeMs) continue; // < 7 Tage → noch warten

      const meta = (u.user_metadata as Record<string, unknown> | undefined) ?? {};
      const lastReminder = meta.last_invite_reminder_at;
      if (typeof lastReminder === "string") {
        const lastTs = new Date(lastReminder).getTime();
        if (jetzt - lastTs < tageGrenzeMs) continue; // < 7T seit letztem Reminder
      }

      kandidaten.push({
        id: u.id,
        email: u.email,
        invited_at: u.invited_at,
        tageEingeladen: Math.floor((jetzt - invitedTs) / (24 * 60 * 60 * 1000)),
        user_metadata: meta,
      });
    }
    if (!data.users || data.users.length < 200) break;
    page++;
  }

  // 3) Reminder-Mail an jeden Kandidaten senden + Metadaten updaten
  const base = appUrl();
  const loginUrl = base ? `${base}/login` : "https://www.vitness-crew.de/login";

  let geschickt = 0;
  let fehler = 0;
  for (const k of kandidaten) {
    const vorname =
      (k.user_metadata.first_name as string | undefined) ??
      (k.user_metadata.full_name as string | undefined) ??
      "im Team";
    const { subject, html, text } = reminderMail({
      vorname,
      loginUrl,
      tageEingeladen: k.tageEingeladen,
    });
    const r = await sendEmail({ to: k.email, subject, html, text });
    if (r.ok) {
      geschickt++;
      // Metadaten updaten — Mehrfach-Versendung verhindern
      await admin.auth.admin.updateUserById(k.id, {
        user_metadata: {
          ...k.user_metadata,
          last_invite_reminder_at: new Date().toISOString(),
        },
      });
    } else {
      fehler++;
      console.warn(
        `[cron/invite-reminder] Mail an ${k.email} failed: ${r.message}`,
      );
    }
  }

  return NextResponse.json({
    ok: true,
    kandidaten: kandidaten.length,
    geschickt,
    fehler,
  });
}
