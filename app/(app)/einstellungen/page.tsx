import { LogOut } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { requireProfile } from "@/lib/auth";
import { rolleLabel } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { abmelden } from "@/app/login/actions";
import { ProfilForm } from "./ProfilForm";
import { PasswortForm } from "./PasswortForm";
import { EmailForm } from "./EmailForm";
import { AvatarUpload } from "./AvatarUpload";
import { IdentityCard } from "./IdentityCard";
import { EinstellungenTabs } from "./EinstellungenTabs";

export default async function EinstellungenPage() {
  const profile = await requireProfile();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const aktuelleEmail = user?.email ?? "";

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        eyebrow="Mein Konto"
        title="Einstellungen"
        description="Dein Profilbild, Login-Daten und Telefon — an einem Ort."
      />

      <IdentityCard
        avatarSlot={
          <AvatarUpload
            initialPfad={profile.avatar_path}
            fullName={profile.full_name}
          />
        }
        logoutSlot={
          <form action={abmelden}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </button>
          </form>
        }
        fullName={profile.full_name}
        rolleText={rolleLabel(profile.role)}
        email={aktuelleEmail}
        phone={profile.phone}
      />

      <EinstellungenTabs
        profilFormSlot={
          <ProfilForm
            initialFirstName={profile.first_name ?? ""}
            initialLastName={profile.last_name ?? ""}
            initialPhone={profile.phone ?? ""}
          />
        }
        emailFormSlot={<EmailForm aktuelleEmail={aktuelleEmail} />}
        passwortFormSlot={<PasswortForm />}
      />
    </div>
  );
}
