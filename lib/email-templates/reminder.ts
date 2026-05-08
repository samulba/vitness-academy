/**
 * Reminder-Email — geht raus an Mitarbeiter die nach 7 Tagen ihren
 * Magic-Link aus der Welcome-Mail noch nicht angeklickt haben.
 * Kurz, freundlich, mit klarem CTA + Hinweis auf Spam-Ordner.
 */

export type ReminderMailInput = {
  vorname: string;
  loginUrl: string;
  tageEingeladen: number;
};

export function reminderMail(input: ReminderMailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { vorname, loginUrl, tageEingeladen } = input;
  const subject = "Erinnerung: Dein Vitness-Crew-Account wartet auf Dich";

  const html = `<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escape(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f7f5f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1f;line-height:1.5;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f7f5f3;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
            <tr>
              <td style="background:linear-gradient(135deg,#b50f5f 0%,#e54295 100%);padding:28px 32px;">
                <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Vitness Crew · Erinnerung</p>
                <h1 style="margin:6px 0 0;font-size:22px;line-height:1.2;font-weight:600;letter-spacing:-0.02em;color:#ffffff;">Hey ${escape(vorname)} 👋</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <p style="margin:0 0 14px;font-size:15px;color:#3a3a44;">
                  Du bist seit ${tageEingeladen} Tagen eingeladen, hast aber den
                  Anmelde-Link noch nicht angeklickt.
                </p>
                <p style="margin:0 0 20px;font-size:14px;color:#6b6b76;">
                  Vielleicht ist die erste Mail im Spam-Ordner gelandet — schau dort kurz nach.
                  Sonst kannst Du Dich auch direkt mit dem Link unten anmelden.
                </p>
                <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:8px 0 24px;">
                  <tr>
                    <td style="background:#b50f5f;border-radius:10px;">
                      <a href="${escape(loginUrl)}" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">
                        Jetzt anmelden &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:12px;color:#9a9aa3;">
                  Falls Du den Account nicht mehr brauchst, kannst Du diese Mail einfach
                  ignorieren — Du bekommst dann keine weiteren Erinnerungen.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 32px 24px;border-top:1px solid #ececef;">
                <p style="margin:0;font-size:11px;color:#9a9aa3;">
                  Diese Mail wurde automatisch versendet. Antworten gehen an
                  team@vitness-crew.de.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const text = [
    `Hey ${vorname},`,
    "",
    `Du bist seit ${tageEingeladen} Tagen eingeladen, hast aber den Anmelde-Link noch nicht angeklickt.`,
    "",
    "Vielleicht ist die erste Mail im Spam-Ordner gelandet — schau dort kurz nach. Sonst kannst Du Dich auch direkt mit dem Link unten anmelden:",
    "",
    loginUrl,
    "",
    "Falls Du den Account nicht mehr brauchst, kannst Du diese Mail einfach ignorieren.",
    "",
    "—",
    "Vitness Crew · team@vitness-crew.de",
  ].join("\n");

  return { subject, html, text };
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
