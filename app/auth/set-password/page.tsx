import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/brand/Logo";
import { SetPasswordForm } from "./SetPasswordForm";

export const dynamic = "force-dynamic";

export default async function SetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ohne Session kein Setup — auf Login redirecten
  if (!user) {
    redirect("/login?fehler=bitte-erst-einloggen");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex items-center gap-2.5">
          <Logo size={32} priority />
          <span className="text-[14px] font-semibold tracking-tight">
            Vitness Crew
          </span>
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[hsl(var(--brand-pink))]">
            Account einrichten
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Passwort setzen
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Lege ein Passwort fest, mit dem Du Dich künftig anmeldest.
            Mindestens 8 Zeichen.
          </p>
        </div>

        <div className="mt-6">
          <SetPasswordForm email={user.email ?? null} />
        </div>
      </div>
    </main>
  );
}
