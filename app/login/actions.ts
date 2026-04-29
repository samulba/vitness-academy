"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { startseiteFuerRolle, type Rolle } from "@/lib/auth";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, archived_at")
    .eq("id", data.user.id)
    .single();

  if (profile?.archived_at) {
    await supabase.auth.signOut();
    redirect("/login?archived=1");
  }

  const rolle = (profile?.role as Rolle | undefined) ?? "mitarbeiter";

  if (weiter && weiter.startsWith("/") && !weiter.startsWith("//")) {
    redirect(weiter);
  }
  redirect(startseiteFuerRolle(rolle));
}

export async function abmelden() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
