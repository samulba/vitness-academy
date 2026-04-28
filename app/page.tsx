import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { startseiteFuerRolle } from "@/lib/auth";

export default async function RootPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  redirect(startseiteFuerRolle(profile.role));
}
