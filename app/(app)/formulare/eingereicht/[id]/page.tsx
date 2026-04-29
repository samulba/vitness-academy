import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { ladeSubmission, STATUS_LABEL } from "@/lib/formulare";
import { formatDatum } from "@/lib/format";

export default async function EingereichtPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const s = await ladeSubmission(id);
  if (!s || s.submitted_by !== profile.id) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <Link
        href="/formulare"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zu allen Formularen
      </Link>

      <div className="rounded-3xl border-2 border-[hsl(var(--success))] bg-[hsl(var(--success)/0.05)] p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--success))] text-white">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="mt-4 text-balance text-2xl font-semibold tracking-tight">
          Eingereicht — danke!
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {s.template_title ?? "Dein Formular"} wurde am{" "}
          {formatDatum(s.submitted_at)} an die Studioleitung gesendet.
        </p>
        <p className="mt-1 inline-flex rounded-full bg-[hsl(var(--brand-pink)/0.12)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--brand-pink))]">
          {STATUS_LABEL[s.status]}
        </p>
      </div>

      <Link
        href="/formulare"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Weitere Formulare ausfüllen
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
