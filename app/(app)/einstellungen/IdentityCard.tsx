import { Mail, Phone } from "lucide-react";

export function IdentityCard({
  avatarSlot,
  logoutSlot,
  fullName,
  rolleText,
  email,
  phone,
}: {
  avatarSlot: React.ReactNode;
  logoutSlot: React.ReactNode;
  fullName: string | null;
  rolleText: string;
  email: string;
  phone: string | null;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div className="flex flex-wrap items-center gap-6">
          {avatarSlot}
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
                {fullName ?? "—"}
              </h2>
              <span className="inline-flex items-center rounded-full bg-[hsl(var(--primary)/0.1)] px-2.5 py-0.5 text-[11px] font-medium text-[hsl(var(--primary))]">
                {rolleText}
              </span>
            </div>
            <dl className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="break-all">{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="hover:text-foreground"
                  >
                    {phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground/70">
                    Keine Nummer hinterlegt
                  </span>
                )}
              </div>
            </dl>
          </div>
        </div>
        <div className="shrink-0">{logoutSlot}</div>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Rolle wird vom Studio verwaltet — wenn da etwas falsch ist, sag deiner
        Studioleitung Bescheid.
      </p>
    </section>
  );
}
