import { requireProfile } from "@/lib/auth";
import { Topbar } from "@/components/layout/Topbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { OnboardingDialog } from "@/components/onboarding/OnboardingDialog";
import { CmdK } from "@/components/search/CmdK";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar fullName={profile.full_name} role={profile.role} />
      <div className="flex flex-1">
        <Sidebar rolle={profile.role} fullName={profile.full_name} />
        <main className="flex-1 px-4 pb-20 pt-8 lg:px-10 lg:pb-12 lg:pt-10 2xl:px-16">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
      <MobileNav rolle={profile.role} />
      {!profile.onboarding_done && (
        <OnboardingDialog vorname={profile.first_name ?? profile.full_name} />
      )}
      <CmdK />
    </div>
  );
}
