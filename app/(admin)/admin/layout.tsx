import { requireRole } from "@/lib/auth";
import {
  getAktiverStandort,
  ladeMeineStandorte,
  type StandortMembership,
} from "@/lib/standort-context";
import { istNextJsControlFlow } from "@/lib/admin/safe-loader";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationBellServer } from "@/components/notifications/NotificationBellServer";
import { StandortSwitcher } from "@/components/layout/StandortSwitcher";
import { MobileAdminBanner } from "@/components/admin/MobileAdminBanner";

// Admin-Pages sind ALLE dynamisch (cookies/auth/RLS) -- explizit
// markieren, damit Next.js gar nicht erst versucht, statisch zu
// prerendern. Verhindert "DYNAMIC_SERVER_USAGE"-Errors zur Laufzeit.
export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["fuehrungskraft", "admin", "superadmin"]);

  // Standort-Loading darf das Layout NICHT crashen lassen. Faellt aus
  // (z.B. RLS-Block oder Migration-Lag), wird einfach kein Switcher
  // gezeigt -- Sidebar/Topbar bleiben funktional.
  let standorte: StandortMembership[] = [];
  let aktiv: StandortMembership | null = null;
  try {
    standorte = await ladeMeineStandorte(profile.id);
    aktiv = await getAktiverStandort(standorte);
  } catch (e) {
    if (istNextJsControlFlow(e)) throw e;
    console.error("[AdminLayout] standort load failed:", e);
  }

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
          className="flex-1 px-4 pb-24 pt-6 lg:px-8 lg:pb-10"
        >
          <div className="mx-auto w-full max-w-6xl">
            <MobileAdminBanner />
            {children}
          </div>
        </main>
      </div>
      <MobileNav rolle={profile.role} />
    </div>
  );
}
