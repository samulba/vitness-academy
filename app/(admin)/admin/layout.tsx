import { requireRole } from "@/lib/auth";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole(["fuehrungskraft", "admin", "superadmin"]);

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar fullName={profile.full_name} role={profile.role} />
      <div className="flex flex-1">
        <Sidebar rolle={profile.role} />
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
