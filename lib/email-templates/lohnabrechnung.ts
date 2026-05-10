/**
 * Lohnabrechnung-Hochgeladen-Mail — wird an den Mitarbeiter
 * geschickt nachdem die Studioleitung eine Lohnabrechnung hochgeladen
 * hat. Enthält Monat, Brutto/Netto (wenn gesetzt) + Direktlink zur
 * App-Lohn-Page (NICHT zum PDF direkt, weil Signed-URLs nach 1h
 * ablaufen).
 */

export type LohnabrechnungMailInput = {
  vorname: string;
  monatLabel: string;
  monatYYYYMM: string;
  bruttoCents: number | null;
  nettoCents: number | null;
  appUrl: string;
};

function formatEuro(cents: number): string {
  return (cents / 100).toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export function lohnabrechnungMail(input: LohnabrechnungMailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const { vorname, monatLabel, monatYYYYMM, bruttoCents, nettoCents, appUrl } =
    input;
  const subject = `Deine Lohnabrechnung ${monatLabel} ist da`;
  const lohnUrl = appUrl
    ? `${appUrl}/lohn?monat=${monatYYYYMM}`
    : `https://www.vitness-crew.de/lohn?monat=${monatYYYYMM}`;

  const bruttoZeile =
    bruttoCents !== null
      ? `<tr><td style="padding:6px 0;font-size:13px;color:#6b6b76;">Brutto</td><td align="right" style="padding:6px 0;font-size:14px;font-weight:600;color:#1a1a1f;">${formatEuro(bruttoCents)}</td></tr>`
      : "";
  const nettoZeile =
    nettoCents !== null
      ? `<tr><td style="padding:6px 0;font-size:13px;color:#6b6b76;">Netto</td><td align="right" style="padding:6px 0;font-size:16px;font-weight:700;color:#0d8050;">${formatEuro(nettoCents)}</td></tr>`
      : "";
  const summenBox =
    bruttoZeile || nettoZeile
      ? `<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%" style="margin:0 0 24px;background:#faf8f6;border-radius:12px;border:1px solid #ececef;">
           <tr><td style="padding:18px 20px;">
             <p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#9a9aa3;">${escape(monatLabel)}</p>
             <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
               ${bruttoZeile}
               ${nettoZeile}
             </table>
           </td></tr>
         </table>`
      : "";

  const html = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="de" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<meta name="x-apple-disable-message-reformatting" />
<title>${escape(subject)}</title>
<!--[if mso]><style>table{border-collapse:collapse;} body,td,th{font-family:Arial,sans-serif !important;}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#f7f5f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1a1a1f;line-height:1.5;-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Deine Lohnabrechnung für ${escape(monatLabel)} ist hochgeladen. Hier ansehen.</div>
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background:#f7f5f3;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="560" style="width:100%;max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">

        <tr><td bgcolor="#b50f5f" style="background-color:#b50f5f;background-image:linear-gradient(135deg,#b50f5f 0%,#e54295 100%);padding:40px 32px 36px;text-align:center;">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 16px;">
            <tr>
              <td style="padding:0 8px;"><span style="display:inline-block;width:24px;height:2px;background:rgba(255,255,255,0.6);"></span></td>
              <td style="padding:0 8px;"><p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#ffffff;mso-line-height-rule:exactly;line-height:1;">Vitness Crew</p></td>
              <td style="padding:0 8px;"><span style="display:inline-block;width:24px;height:2px;background:rgba(255,255,255,0.6);"></span></td>
            </tr>
          </table>
          <h1 style="margin:0;font-size:28px;line-height:1.15;font-weight:600;letter-spacing:-0.02em;color:#ffffff;">Lohnabrechnung ist da.</h1>
        </td></tr>

        <tr><td style="padding:32px 32px 24px;">
          <p style="margin:0 0 16px;font-size:15px;color:#3a3a44;">
            Hey ${escape(vorname)}, Deine Lohnabrechnung für <strong>${escape(monatLabel)}</strong> ist gerade hochgeladen worden. Du kannst sie jetzt in der App ansehen und herunterladen.
          </p>

          ${summenBox}

          <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="margin:8px 0 24px;">
            <tr><td>
              <!--[if mso]>
              <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${escape(lohnUrl)}" style="height:48px;v-text-anchor:middle;width:240px;" arcsize="20%" stroke="f" fillcolor="#b50f5f">
                <w:anchorlock/>
                <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:600;">Lohnabrechnung ansehen</center>
              </v:roundrect>
              <![endif]-->
              <!--[if !mso]><!-->
              <a href="${escape(lohnUrl)}" style="display:inline-block;padding:14px 28px;background-color:#b50f5f;color:#ffffff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:600;mso-hide:all;">Lohnabrechnung ansehen →</a>
              <!--<![endif]-->
            </td></tr>
          </table>

          <p style="margin:0;font-size:13px;color:#9a9aa3;">
            Du kannst Deine Schichten für ${escape(monatLabel)} in der App auch direkt mit der Abrechnung abgleichen.
          </p>
        </td></tr>

        <tr><td style="padding:18px 32px 28px;border-top:1px solid #ececef;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9a9aa3;">
            Diese Mail wurde automatisch versendet. Antworten gehen an
            <a href="mailto:team@vitness-crew.de" style="color:#9a9aa3;text-decoration:underline;">team@vitness-crew.de</a>.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    `Hey ${vorname},`,
    "",
    `Deine Lohnabrechnung für ${monatLabel} ist hochgeladen.`,
    "",
    bruttoCents !== null ? `Brutto: ${formatEuro(bruttoCents)}` : "",
    nettoCents !== null ? `Netto:  ${formatEuro(nettoCents)}` : "",
    bruttoCents !== null || nettoCents !== null ? "" : null,
    `Ansehen + Download: ${lohnUrl}`,
    "",
    "—",
    "Vitness Crew · team@vitness-crew.de",
  ]
    .filter((l) => l !== null)
    .join("\n");

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
