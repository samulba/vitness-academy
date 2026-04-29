import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PraxisStatusBadge } from "@/components/praxis/PraxisStatusBadge";
import { EntscheidungsForm } from "@/components/praxis/EntscheidungsForm";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminCard, AdminCardHeader } from "@/components/admin/AdminCard";
import { ladePraxisInbox } from "@/lib/praxis";
import { formatDatum } from "@/lib/format";
import { praxisFreigeben, praxisAblehnen } from "./actions";

function initialen(name: string | null): string {
  if (!name) return "??";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function AdminPraxisInboxPage() {
  const offen = await ladePraxisInbox(["bereit"]);
  const erledigt = await ladePraxisInbox(["freigegeben", "abgelehnt"]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Anfragen"
        description="Mitarbeiter, die sich für eine praktische Aufgabe bereit gemeldet haben. Kurz prüfen und entscheiden."
      />

      <AdminCard>
        <AdminCardHeader title={`Offen (${offen.length})`} />
        {offen.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">
            Aktuell keine offenen Anfragen. Stark!
          </div>
        ) : (
          <div className="divide-y divide-border">
            {offen.map((eintrag) => (
              <div
                key={eintrag.signoff_id ?? eintrag.id}
                className="px-5 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">
                        {initialen(eintrag.user_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-[14px] font-medium leading-tight">
                        {eintrag.user_name ?? "Mitarbeiter"} ·{" "}
                        <span className="text-muted-foreground">
                          {eintrag.title}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[eintrag.learning_path_title, eintrag.lesson_title]
                          .filter(Boolean)
                          .join(" · ")}
                        {eintrag.submitted_at
                          ? ` · gemeldet am ${formatDatum(eintrag.submitted_at)}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <PraxisStatusBadge status={eintrag.status} />
                </div>
                <div className="mt-3 space-y-3 pl-12">
                  {eintrag.description ? (
                    <p className="text-sm text-muted-foreground">
                      {eintrag.description}
                    </p>
                  ) : null}
                  {eintrag.user_note ? (
                    <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Notiz vom Mitarbeiter
                      </p>
                      <p className="mt-1 whitespace-pre-wrap">
                        {eintrag.user_note}
                      </p>
                    </div>
                  ) : null}
                  {eintrag.signoff_id ? (
                    <EntscheidungsForm
                      freigeben={praxisFreigeben.bind(null, eintrag.signoff_id)}
                      ablehnen={praxisAblehnen.bind(null, eintrag.signoff_id)}
                    />
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </AdminCard>

      <AdminCard>
        <AdminCardHeader
          title={`Bereits entschieden (${erledigt.length})`}
          description="Letzte Freigaben und Ablehnungen."
        />
        {erledigt.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Hier erscheinen freigegebene und abgelehnte Anfragen.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {erledigt.map((e) => (
              <div
                key={e.signoff_id ?? e.id}
                className="px-5 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm">
                    <span className="font-medium">
                      {e.user_name ?? "Mitarbeiter"}
                    </span>
                    <span className="text-muted-foreground"> · {e.title}</span>
                  </p>
                  <PraxisStatusBadge status={e.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Entschieden am {formatDatum(e.approved_at)} von{" "}
                  {e.approved_by_name ?? "—"}
                </p>
                {e.reviewer_note && (
                  <p className="mt-2 whitespace-pre-wrap rounded-md border border-border bg-muted/30 p-2 text-xs text-muted-foreground">
                    {e.reviewer_note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </AdminCard>
    </div>
  );
}
