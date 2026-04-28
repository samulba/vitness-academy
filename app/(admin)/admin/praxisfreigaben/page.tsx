import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PraxisStatusBadge } from "@/components/praxis/PraxisStatusBadge";
import { EntscheidungsForm } from "@/components/praxis/EntscheidungsForm";
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
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Praxisfreigaben
        </h1>
        <p className="mt-1 text-muted-foreground">
          Mitarbeiter, die sich für eine praktische Aufgabe bereit gemeldet
          haben. Kurz prüfen und entscheiden.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Offen{" "}
          <span className="text-base font-normal text-muted-foreground">
            ({offen.length})
          </span>
        </h2>
        {offen.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              Aktuell keine offenen Anfragen. Stark!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {offen.map((eintrag) => (
              <Card key={eintrag.signoff_id ?? eintrag.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {initialen(eintrag.user_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">
                          {eintrag.user_name ?? "Mitarbeiter"} ·{" "}
                          {eintrag.title}
                        </CardTitle>
                        <CardDescription>
                          {[eintrag.learning_path_title, eintrag.lesson_title]
                            .filter(Boolean)
                            .join(" · ")}
                          {eintrag.submitted_at
                            ? ` · gemeldet am ${formatDatum(eintrag.submitted_at)}`
                            : ""}
                        </CardDescription>
                      </div>
                    </div>
                    <PraxisStatusBadge status={eintrag.status} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {eintrag.description ? (
                    <p className="text-sm text-muted-foreground">
                      {eintrag.description}
                    </p>
                  ) : null}

                  {eintrag.user_note ? (
                    <div className="rounded-md border bg-muted/40 p-3 text-sm">
                      <div className="text-xs uppercase tracking-wider text-muted-foreground">
                        Notiz vom Mitarbeiter
                      </div>
                      <p className="whitespace-pre-wrap">{eintrag.user_note}</p>
                    </div>
                  ) : null}

                  {eintrag.signoff_id ? (
                    <EntscheidungsForm
                      freigeben={praxisFreigeben.bind(null, eintrag.signoff_id)}
                      ablehnen={praxisAblehnen.bind(null, eintrag.signoff_id)}
                    />
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">
          Bereits entschieden{" "}
          <span className="text-base font-normal text-muted-foreground">
            ({erledigt.length})
          </span>
        </h2>
        {erledigt.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Hier erscheinen freigegebene und abgelehnte Anfragen.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {erledigt.map((e) => (
              <Card key={e.signoff_id ?? e.id} className="bg-muted/20">
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-sm">
                        {e.user_name ?? "Mitarbeiter"} · {e.title}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Entschieden am {formatDatum(e.approved_at)} von{" "}
                        {e.approved_by_name ?? "—"}
                      </CardDescription>
                    </div>
                    <PraxisStatusBadge status={e.status} />
                  </div>
                </CardHeader>
                {e.reviewer_note ? (
                  <CardContent className="text-sm text-muted-foreground">
                    <div className="rounded-md border bg-background p-3">
                      <div className="text-xs uppercase tracking-wider">
                        Notiz
                      </div>
                      <p className="whitespace-pre-wrap">{e.reviewer_note}</p>
                    </div>
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
