import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Mail,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { formatDatumUhrzeitBerlin } from "@/lib/format";
import type { AuthStatusInfo } from "@/lib/admin/auth-status";
import {
  einladungErneutSenden,
  mitarbeiterEndgueltigLoeschen,
} from "../../app/(admin)/admin/benutzer/actions";
import { LoeschenSubmitButton } from "./LoeschenSubmitButton";

/**
 * Anzeige des Auth-Status auf der Mitarbeiter-Detail-Page:
 *   - Eingeladen (Magenta): Datum der Einladung, Re-invite-Button +
 *     Endgueltig-Löschen-Button (nur für Test-User die nie
 *     eingeloggt waren)
 *   - Aktiv (Gruen): letzter Login + first-login-Datum
 *   - Inaktiv (Grau): letzter Login (war > 30 Tage)
 */
export function AuthStatusBlock({
  benutzerId,
  status,
}: {
  benutzerId: string;
  status: AuthStatusInfo | null;
}) {
  if (!status) return null;

  if (status.status === "eingeladen") {
    return (
      <section className="flex flex-col gap-4 rounded-2xl border border-[hsl(var(--brand-pink)/0.3)] bg-[hsl(var(--brand-pink)/0.04)] p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--brand-pink)/0.15)] text-[hsl(var(--brand-pink))]">
          <Mail className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
            Wartet auf erste Anmeldung
          </p>
          <p className="mt-0.5 text-sm font-semibold">
            Einladung gesendet
            {status.invited_at && (
              <span className="font-normal text-muted-foreground">
                {" am "}
                {formatDatumUhrzeitBerlin(status.invited_at)}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Mitarbeiter:in hat den Magic-Link aus der Welcome-Mail noch nicht
            angeklickt.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <form action={einladungErneutSenden.bind(null, benutzerId)}>
            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-[hsl(var(--primary))] px-4 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_4px_14px_-4px_hsl(var(--primary)/0.5)] transition-all hover:bg-[hsl(var(--primary)/0.9)] active:scale-95 sm:w-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Erneut senden
            </button>
          </form>
          <form
            action={mitarbeiterEndgueltigLoeschen.bind(null, benutzerId)}
          >
            <LoeschenSubmitButton />
          </form>
        </div>
      </section>
    );
  }

  if (status.status === "inaktiv") {
    return (
      <section className="flex items-center gap-4 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
          <Clock className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Inaktiv
          </p>
          <p className="mt-0.5 text-sm font-semibold">
            Längere Zeit nicht angemeldet
          </p>
          {status.last_sign_in_at && (
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              Letzter Login: {formatDatumUhrzeitBerlin(status.last_sign_in_at)}
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="flex items-center gap-4 rounded-2xl border border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success)/0.04)] p-5 sm:p-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]">
        <CheckCircle2 className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--success))]">
          Aktiv
        </p>
        <p className="mt-0.5 text-sm font-semibold">
          {status.last_sign_in_at
            ? `Letzter Login: ${formatDatumUhrzeitBerlin(status.last_sign_in_at)}`
            : "Eingeloggt"}
        </p>
        {status.email_confirmed_at && (
          <p className="mt-1 text-xs text-muted-foreground">
            Account bestätigt am {formatDatumUhrzeitBerlin(status.email_confirmed_at)}
          </p>
        )}
      </div>
    </section>
  );
}

export { Trash2 };
