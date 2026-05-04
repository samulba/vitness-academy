import { requireRole } from "@/lib/auth";
import {
  getAktiverStandort,
  ladeMeineStandorte,
} from "@/lib/standort-context";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationBellServer } from "@/components/notifications/NotificationBellServer";
import { StandortSwitcher } from "@/components/layout/StandortSwitcher";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["fuehrungskraft", "admin", "superadmin"]);

  const standorte = await ladeMeineStandorte(profile.id);
  const aktiv = await getAktiverStandort(standorte);

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
        />
        <main
          id="main"
          className="flex-1 px-4 pb-20 pt-6 lg:px-8 lg:pb-10"
        >
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
      <MobileNav rolle={profile.role} />
    </div>
  );
}
