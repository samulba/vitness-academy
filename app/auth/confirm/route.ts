import { NextResponse, type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth-Confirm-Route für Magic-Links aus Email-Templates:
 *   - Invite-User-Mail (type=invite)
 *   - Passwort-Reset (type=recovery)
 *   - Magic-Link-Login (type=magiclink)
 *   - Email-Bestätigung (type=signup, type=email_change)
 *
 * Der Email-Template-Link muss in Supabase so aufgebaut sein:
 *   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/auth/set-password
 *
 * Diese Route verifiziert den Token via supabase.auth.verifyOtp(),
 * setzt die Session-Cookies und redirected dann zum next-Param.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (!token_hash || !type) {
    return NextResponse.redirect(
      new URL("/login?fehler=link-ungueltig", request.url),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash });

  if (error) {
    console.error("[auth/confirm] verifyOtp:", error);
    // Link abgelaufen oder schon benutzt — User auf Login mit Hinweis
    return NextResponse.redirect(
      new URL(
        `/login?fehler=${encodeURIComponent(
          "Link ist abgelaufen oder wurde schon benutzt. Lass Dir eine neue Einladung schicken.",
        )}`,
        request.url,
      ),
    );
  }

  // Erfolg: Session ist gesetzt, redirected zum next-Param.
  // Bei Invite/Recovery: typischerweise /auth/set-password
  // Bei Magic-Link-Login: /dashboard
  return NextResponse.redirect(new URL(next, request.url));
}
