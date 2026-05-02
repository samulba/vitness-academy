import { createClient } from "@/lib/supabase/server";
import {
  istValideKategorie,
  type Announcement,
  type Importance,
} from "@/lib/infos-types";

// Re-export client-safe Types fuer Server-Code-Convenience
export type {
  Announcement,
  Importance,
  InfoKategorie,
} from "@/lib/infos-types";
export {
  INFO_KATEGORIEN,
  istValideKategorie,
  kategorieLabel,
} from "@/lib/infos-types";

type Roh = {
  id: string;
  location_id: string | null;
  category: string | null;
  title: string;
  body: string;
  importance: string;
  pinned: boolean;
  published: boolean;
  author_id: string | null;
  profiles: { full_name: string | null } | null;
  created_at: string;
  updated_at: string;
};

function map(r: Roh): Announcement {
  const cat = r.category && istValideKategorie(r.category) ? r.category : "allgemein";
  return {
    id: r.id,
    location_id: r.location_id,
    category: cat,
    title: r.title,
    body: r.body,
    importance: (["info", "warning", "critical"].includes(r.importance)
      ? r.importance
      : "info") as Importance,
    pinned: r.pinned,
    published: r.published,
    author_id: r.author_id,
    author_name: r.profiles?.full_name ?? null,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

const SELECT_COLS = `id, location_id, category, title, body, importance, pinned, published,
       author_id, created_at, updated_at,
       profiles:author_id ( full_name )`;

export async function ladeAnnouncements(opts?: {
  nurPublished?: boolean;
}): Promise<Announcement[]> {
  const supabase = await createClient();
  let q = supabase
    .from("studio_announcements")
    .select(SELECT_COLS)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (opts?.nurPublished !== false) {
    q = q.eq("published", true);
  }
  const { data } = await q;
  return ((data ?? []) as unknown as Roh[]).map(map);
}

export async function ladeAnnouncement(
  id: string,
): Promise<Announcement | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("studio_announcements")
    .select(SELECT_COLS)
    .eq("id", id)
    .maybeSingle();
  return data ? map(data as unknown as Roh) : null;
}

/**
 * Liefert die IDs der Announcements, die der User schon gelesen hat.
 */
export async function ladeReadIds(userId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_announcement_reads")
    .select("announcement_id")
    .eq("user_id", userId);
  return new Set(
    ((data ?? []) as { announcement_id: string }[]).map((r) => r.announcement_id),
  );
}

/**
 * Erste ungelesene + critical Announcement (fuer Dashboard-Banner).
 *
 * Bewusst NUR critical, nicht mehr warning -- seitdem Mitarbeiter
 * selbst Infos posten duerfen, wuerde 'warning' jeden Mitarbeiter-
 * Hinweis als Banner auf jedem Dashboard zeigen.
 */
export async function aktiveBannerInfo(
  userId: string,
): Promise<Announcement | null> {
  const [alle, gelesen] = await Promise.all([
    ladeAnnouncements({ nurPublished: true }),
    ladeReadIds(userId),
  ]);
  const ungelesen = alle.filter(
    (a) => !gelesen.has(a.id) && a.importance === "critical",
  );
  return ungelesen[0] ?? null;
}
