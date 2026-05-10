import { requireRole } from "@/lib/auth";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { NotificationBellServer } from "@/components/notifications/NotificationBellServer";
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
  // Permissions als string[] für Client-Components (Set ist nicht
  // serialisierbar über Server-Boundary).
  const permissionsArr = Array.from(profile.permissions);

  // KEIN Standort-Switcher im Admin-Bereich — Verwaltung sieht
  // standardmaessig alle Standorte. Filter pro Page bei Bedarf via
  // URL-Param. Im Mitarbeiter-Mode bleibt der Switcher in der Topbar/
  // Sidebar weiterhin verfügbar (eigenes Layout).
  //
  // Layout-Pattern: Topbar/Sidebar/MobileNav sind alle position:fixed
  // -- keine flex-Container drumherum, weil das auf iOS Safari den
  // fixed-Behavior unzuverlaessig macht. main steuert Padding selbst
  // (pt für mobile Topbar, lg:ml-60 für Desktop Sidebar).
  return (
    <>
      <Topbar
        fullName={profile.full_name}
        role={profile.role}
        avatarPath={profile.avatar_path}
        notificationSlot={<NotificationBellServer placement="auto" />}
      />
      <Sidebar
        rolle={profile.role}
        fullName={profile.full_name}
        avatarPath={profile.avatar_path}
        notificationSlot={<NotificationBellServer placement="side-right" />}
        kannProvisionen={profile.kann_provisionen}
        permissions={permissionsArr}
      />
      <main
        id="main"
        className="min-h-screen overflow-x-clip px-4 pb-24 pt-20 lg:ml-60 lg:px-8 lg:pb-10 lg:pt-6"
      >
        <div className="mx-auto w-full max-w-6xl">
          <MobileAdminBanner />
          {children}
        </div>
      </main>
      <MobileNav
        rolle={profile.role}
        kannProvisionen={profile.kann_provisionen}
        permissions={permissionsArr}
      />
    </>
  );
}
