/**
 * Welcome-Email die der neue Mitarbeiter bekommt nachdem ein Admin
 * den Account angelegt hat. Magenta-Brand, klar, motivierend.
 *
 * Liefert HTML + Plain-Text. Plain-Text ist der Fallback fuer Clients
 * die kein HTML rendern (z.B. enterprise-Mail-Clients).
 */

export type WelcomeMailInput = {
  vorname: string;
  loginUrl: string;
  studioleitung?: string;
};

export function welcomeMail(input: WelcomeMailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { vorname, loginUrl, studioleitung } = input;
  const subject = "Willkommen bei der Vitness Crew";

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
              <td style="background:linear-gradient(135deg,#b50f5f 0%,#e54295 100%);padding:32px 32px 28px;">
                <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;color:rgba(255,255,255,0.85);">Vitness Crew</p>
                <h1 style="margin:8px 0 0;font-size:28px;line-height:1.15;font-weight:600;letter-spacing:-0.02em;color:#ffffff;">Willkommen, ${escape(vorname)}.</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 24px;">
                <p style="margin:0 0 16px;font-size:15px;color:#3a3a44;">
                  Schoen dass Du dabei bist. Dein Account fuer die Vitness-Crew-App
                  ist eingerichtet — alles was Du im Studio-Alltag brauchst, an einem Ort:
                </p>
                <ul style="margin:0 0 24px;padding:0 0 0 20px;font-size:14px;color:#3a3a44;">
                  <li style="margin-bottom:6px;">Aufgaben &amp; Putzprotokolle</li>
                  <li style="margin-bottom:6px;">Maengel melden, Schichten tracken</li>
                  <li style="margin-bottom:6px;">Krankmeldung &amp; Urlaub einreichen</li>
                  <li style="margin-bottom:6px;">Lernpfade fuer Dein Onboarding</li>
                </ul>
                <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:8px 0 28px;">
                  <tr>
                    <td style="background:#b50f5f;border-radius:10px;">
                      <a href="${escape(loginUrl)}" style="display:inline-block;padding:13px 24px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">
                        Jetzt anmelden &rarr;
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0 0 8px;font-size:13px;color:#6b6b76;">
                  Beim ersten Login wirst Du gebeten ein Passwort zu setzen. Danach
                  fuehrt Dich ein kurzer Onboarding-Assistent durch die wichtigsten
                  Bereiche.
                </p>
                ${
                  studioleitung
                    ? `<p style="margin:16px 0 0;font-size:13px;color:#6b6b76;">Bei Fragen wende Dich an Deine Studioleitung (${escape(studioleitung)}).</p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px 28px;border-top:1px solid #ececef;">
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
    `Willkommen bei der Vitness Crew, ${vorname}!`,
    "",
    "Dein Account fuer die Vitness-Crew-App ist eingerichtet.",
    "",
    "In der App findest Du:",
    "- Aufgaben & Putzprotokolle",
    "- Maengel melden, Schichten tracken",
    "- Krankmeldung & Urlaub einreichen",
    "- Lernpfade fuer Dein Onboarding",
    "",
    `Anmelden: ${loginUrl}`,
    "",
    "Beim ersten Login setzt Du Dein Passwort. Danach fuehrt Dich ein kurzer Onboarding-Assistent durch die wichtigsten Bereiche.",
    studioleitung
      ? `\nBei Fragen wende Dich an Deine Studioleitung (${studioleitung}).`
      : "",
    "",
    "—",
    "Vitness Crew · team@vitness-crew.de",
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}

/** Minimaler HTML-Escape fuer User-Input in den Mail-Texten. */
function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
