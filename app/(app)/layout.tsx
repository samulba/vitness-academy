import { requireProfile } from "@/lib/auth";
import { generiereWiederkehrendeAufgaben } from "@/lib/aufgaben";
import {
  getAktiverStandort,
  ladeMeineStandorte,
  type StandortMembership,
} from "@/lib/standort-context";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog";
import { CmdK } from "@/components/search/CmdK";
import { NotificationBellServer } from "@/components/notifications/NotificationBellServer";
import { StandortSwitcher } from "@/components/layout/StandortSwitcher";

// App-Pages sind ALLE dynamisch (Auth + Cookies). Verhindert
// "DYNAMIC_SERVER_USAGE"-Errors zur Laufzeit.
export const dynamic = "force-dynamic";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();

  // Recurring-Tasks-Generierung und Standort-Loading sind unabhaengig
  // -- parallel statt sequenziell ausfuehren spart einen Roundtrip.
  // Beide defensiv: bei Fehler weiter ohne Crash.
  let standorte: StandortMembership[] = [];
  let aktiv: StandortMembership | null = null;
  await Promise.all([
    (async () => {
      try {
        await generiereWiederkehrendeAufgaben();
      } catch (e) {
        if (istNextJsControlFlow(e)) throw e;
        console.error("[AppLayout] generiereWiederkehrendeAufgaben failed:", e);
      }
    })(),
    (async () => {
      try {
        standorte = await ladeMeineStandorte(profile.id);
        aktiv = await getAktiverStandort(standorte);
      } catch (e) {
        if (istNextJsControlFlow(e)) throw e;
        console.error("[AppLayout] standort load failed:", e);
      }
    })(),
  ]);

  const switcherTopbar = (
    <StandortSwitcher aktiv={aktiv} optionen={standorte} variant="compact" />
  );
  const switcherSidebar = (
    <StandortSwitcher aktiv={aktiv} optionen={standorte} variant="row" />
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar
        fullName={profile.full_name}
        role={profile.role}
        avatarPath={profile.avatar_path}
        notificationSlot={<NotificationBellServer placement="auto" />}
        standortSlot={switcherTopbar}
      />
      <div className="flex flex-1">
        <Sidebar
          rolle={profile.role}
          fullName={profile.full_name}
          avatarPath={profile.avatar_path}
          notificationSlot={<NotificationBellServer placement="side-right" />}
          standortSlot={switcherSidebar}
          kannProvisionen={profile.kann_provisionen}
        />
        <main
          id="main"
          className="min-w-0 flex-1 overflow-x-hidden px-4 pb-24 pt-6 sm:pt-8 lg:px-10 lg:pb-12 lg:pt-10 2xl:px-16"
        >
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
      <MobileNav
        rolle={profile.role}
        kannProvisionen={profile.kann_provisionen}
      />
      {!profile.onboarding_done && (
        <OnboardingDialog vorname={profile.first_name ?? profile.full_name} />
      )}
      <CmdK />
    </div>
  );
}
