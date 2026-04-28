import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ArtikelFormular } from "@/components/admin/ArtikelFormular";
import { createClient } from "@/lib/supabase/server";
import { artikelAnlegen } from "../actions";

async function ladeKategorien() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("knowledge_categories")
    .select("id, name")
    .order("sort_order", { ascending: true });
  return (data ?? []) as { id: string; name: string }[];
}

export default async function NeuerArtikelPage() {
  const kategorien = await ladeKategorien();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/wissen"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Wissensdatenbank
      </Link>

      <header>
        <h1 className="text-3xl font-semibold tracking-tight">
          Neuer Wissensartikel
        </h1>
      </header>

      <ArtikelFormular
        modus="anlegen"
        action={artikelAnlegen}
        kategorien={kategorien}
      />
    </div>
  );
}
