import {
  MessageCircle,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { requireProfile } from "@/lib/auth";
import { ladeFeedback, kategorieLabel, type Sentiment } from "@/lib/feedback";
import { getAktiverStandort } from "@/lib/standort-context";
import { formatDatum } from "@/lib/format";
import { FeedbackForm } from "./FeedbackForm";

const SENTIMENT_META: Record<
  Sentiment,
  { icon: typeof Smile; label: string; tint: string; bar: string }
> = {
  positive: {
    icon: Smile,
    label: "Positiv",
    tint: "bg-emerald-500/15 text-emerald-700",
    bar: "border-l-emerald-500",
  },
  neutral: {
    icon: Meh,
    label: "Neutral",
    tint: "bg-zinc-500/15 text-zinc-700",
    bar: "border-l-zinc-400",
  },
  negative: {
    icon: Frown,
    label: "Negativ",
    tint: "bg-rose-500/15 text-rose-700",
    bar: "border-l-rose-500",
  },
};

export default async function FeedbackPage() {
  const profile = await requireProfile();
  const aktiv = await getAktiverStandort();
  const [meine, alle] = await Promise.all([
    ladeFeedback({ capturedBy: profile.id, limit: 20 }),
    ladeFeedback({ locationId: aktiv?.id ?? null, limit: 30 }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Studio"
        title="Mitglieder-Feedback"
        description="Was sagen die Mitglieder gerade? Kurze Notiz reicht — sammelt sich für die Studioleitung als Stimmungsbild."
      />

      <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
        <FeedbackForm />
      </section>

      {meine.length > 0 && (
        <section>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-[hsl(var(--brand-pink))]">
            Von dir erfasst
          </h2>
          <ul className="mt-3 space-y-2">
            {meine.map((f) => {
              const meta = SENTIMENT_META[f.sentiment];
              const Icon = meta.icon;
              return (
                <li
                  key={f.id}
                  className={`flex gap-3 rounded-xl border border-l-4 border-border bg-card p-4 ${meta.bar}`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.tint}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.tint}`}
                      >
                        {meta.label}
                      </span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                        {kategorieLabel(f.category)}
                      </span>
                      {f.member_name && (
                        <span className="text-xs font-medium">
                          {f.member_name}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formatDatum(f.captured_at)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                      {f.feedback_text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Letzte Erfassungen im Studio
        </h2>
        {alle.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <MessageCircle className="mx-auto h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mt-3 text-sm font-medium">
              Noch keine Erfassungen
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Sobald jemand etwas eingibt, sammelt sich&apos;s hier.
            </p>
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {alle.slice(0, 12).map((f) => {
              const meta = SENTIMENT_META[f.sentiment];
              const Icon = meta.icon;
              const istEigen = f.captured_by === profile.id;
              return (
                <li
                  key={f.id}
                  className={`flex gap-3 rounded-xl border border-border bg-card p-4 ${
                    istEigen ? "ring-1 ring-[hsl(var(--brand-pink)/0.3)]" : ""
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${meta.tint}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-xs font-medium">
                        {f.captured_by_name ?? "Mitarbeiter"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        · {kategorieLabel(f.category)}
                      </span>
                      {f.member_name && (
                        <span className="text-[10px] text-muted-foreground">
                          · {f.member_name}
                        </span>
                      )}
                      <span className="ml-auto text-xs text-muted-foreground">
                        {formatDatum(f.captured_at)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-3 text-sm leading-relaxed">
                      {f.feedback_text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

    </div>
  );
}
