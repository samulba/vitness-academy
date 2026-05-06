import { notFound, redirect } from "next/navigation";
import { ladeZertifikatDetail } from "@/lib/zertifikat";
import { requireProfile } from "@/lib/auth";
import { formatDatum } from "@/lib/format";
import { PrintButton } from "./PrintButton";
import { Logo } from "@/components/brand/Logo";

export default async function ZertifikatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await requireProfile();
  const cert = await ladeZertifikatDetail(id);
  if (!cert) notFound();

  // Sicherheit: nur eigenes Zertifikat anzeigen (RLS sichert auch ab)
  if (cert.user_id !== profile.id) redirect("/dashboard");

  return (
    <main className="min-h-screen bg-[hsl(var(--brand-cream))] py-12 print:bg-white print:py-0">
      {/* Print-Button (versteckt im Druck) */}
      <div className="mx-auto mb-8 flex max-w-3xl items-center justify-between px-6 print:hidden">
        <a
          href={`/lernpfade/${cert.learning_path_id}`}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Zurück zum Pfad
        </a>
        <PrintButton />
      </div>

      {/* Das Zertifikat selbst */}
      <article className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-[hsl(var(--primary)/0.3)] bg-white p-12 shadow-[0_30px_80px_-30px_hsl(var(--primary)/0.3)] print:max-w-full print:rounded-none print:border-0 print:shadow-none sm:p-16">
        {/* Magenta-Eckakzente */}
        <div
          aria-hidden
          className="absolute left-0 top-0 h-2 w-1/3 bg-[hsl(var(--primary))]"
        />
        <div
          aria-hidden
          className="absolute bottom-0 right-0 h-2 w-1/3 bg-[hsl(var(--primary))]"
        />

        <header className="flex items-center justify-between gap-6 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <Logo size={40} />
            <div>
              <p className="text-sm font-semibold tracking-tight">
                Vitness Crew
              </p>
              <p className="text-xs text-muted-foreground">
                Interne Lernplattform
              </p>
            </div>
          </div>
          <p className="text-right font-mono text-xs uppercase tracking-wider text-muted-foreground">
            {cert.certificate_number}
          </p>
        </header>

        <div className="py-12 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--primary))]">
            Zertifikat
          </p>
          <h1 className="mt-6 text-balance font-semibold leading-[1.05] tracking-[-0.025em] text-[clamp(2rem,4vw,3.5rem)]">
            Hiermit wird bestätigt
          </h1>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            dass
          </p>
          <p className="mx-auto mt-4 max-w-xl text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            {cert.user_name ?? "—"}
          </p>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            den Lernpfad
          </p>
          <p className="mx-auto mt-3 max-w-xl text-balance text-xl font-semibold leading-tight text-[hsl(var(--primary))] sm:text-2xl">
            {cert.path_title}
          </p>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            erfolgreich abgeschlossen hat.
          </p>
        </div>

        <footer className="grid grid-cols-1 gap-6 border-t border-border pt-6 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Ausgestellt am
            </p>
            <p className="mt-1 font-medium">
              {formatDatum(cert.generated_at)}
            </p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Studio
            </p>
            <p className="mt-1 font-medium">Vitness</p>
          </div>
        </footer>
      </article>

      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 1.5cm; }
          html, body { background: white !important; }
        }
      `}</style>
    </main>
  );
}
