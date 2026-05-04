"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { startseiteFuerRolle, type Rolle } from "@/lib/auth";

const STANDORT_COOKIE = "vitness_active_location";

export async function anmelden(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const weiter = String(formData.get("weiter") ?? "");

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    const params = new URLSearchParams({ fehler: "credentials" });
    if (weiter) params.set("weiter", weiter);
    redirect(`/login?${params.toString()}`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, archived_at")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    await supabase.auth.signOut();
    redirect("/login?fehler=profil-fehlt");
  }

  if (profile.archived_at) {
    await supabase.auth.signOut();
    redirect("/login?archived=1");
  }

  const rolle = (profile.role as Rolle | undefined) ?? "mitarbeiter";

  if (weiter && weiter.startsWith("/") && !weiter.startsWith("//")) {
    redirect(weiter);
  }
  redirect(startseiteFuerRolle(rolle));
}

export async function abmelden() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Standort-Cookie loeschen, damit auf gemeinsam genutzten Geraeten
  // der naechste User nicht den alten aktiven Standort erbt.
  const jar = await cookies();
  jar.delete(STANDORT_COOKIE);
  redirect("/login");
}
