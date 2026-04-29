import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profil, Rolle } from "@/lib/rollen";

export type { Profil, Rolle } from "@/lib/rollen";
export {
  istAdmin,
  istFuehrungskraftOderHoeher,
  startseiteFuerRolle,
} from "@/lib/rollen";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentProfile(): Promise<Profil | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, full_name, first_name, last_name, phone, role, location_id, onboarding_done",
    )
    .eq("id", user.id)
    .single();

  if (error || !data) return null;
  return data as Profil;
}

export async function requireProfile(): Promise<Profil> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

export async function requireRole(roles: Rolle[]): Promise<Profil> {
  const profile = await requireProfile();
  if (!roles.includes(profile.role)) {
    redirect("/dashboard");
  }
  return profile;
}
