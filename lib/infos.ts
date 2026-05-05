import { createClient } from "@/lib/supabase/server";
import {
  istValideKategorie,
  type Announcement,
  type Importance,
} from "@/lib/infos-types";

// Re-export client-safe Types für Server-Code-Convenience
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
  profiles: { full_name: string | null; avatar_path: string | null } | null;
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
    author_avatar_path: r.profiles?.avatar_path ?? null,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

const SELECT_COLS = `id, location_id, category, title, body, importance, pinned, published,
       author_id, created_at, updated_at,
       profiles:author_id ( full_name, avatar_path )`;

export async function ladeAnnouncements(opts?: {
  nurPublished?: boolean;
  locationId?: string | null;
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
  if (opts?.locationId) {
    q = q.or(`location_id.eq.${opts.locationId},location_id.is.null`);
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
 * Erste ungelesene + critical Announcement (für Dashboard-Banner).
 *
 * Bewusst NUR critical, nicht mehr warning -- seitdem Mitarbeiter
 * selbst Infos posten duerfen, würde 'warning' jeden Mitarbeiter-
 * Hinweis als Banner auf jedem Dashboard zeigen.
 */
export async function aktiveBannerInfo(
  userId: string,
  locationId?: string | null,
): Promise<Announcement | null> {
  const [alle, gelesen] = await Promise.all([
    ladeAnnouncements({ nurPublished: true, locationId }),
    ladeReadIds(userId),
  ]);
  const ungelesen = alle.filter(
    (a) => !gelesen.has(a.id) && a.importance === "critical",
  );
  return ungelesen[0] ?? null;
}

export type InfoStats = {
  posts_diese_woche: number;
  dringende_diese_woche: number;
  aktivste_person: {
    id: string;
    name: string | null;
    avatar_path: string | null;
    posts: number;
  } | null;
  letzte_aktivitaeten: {
    id: string;
    title: string;
    author_name: string | null;
    avatar_path: string | null;
    created_at: string;
  }[];
};

/**
 * Stats für rechte Sidebar auf /infos.
 * Diese Woche = letzte 7 Tage rollierend.
 */
export async function infoStatsDieseWoche(): Promise<InfoStats> {
  const supabase = await createClient();
  const seit = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: posts } = await supabase
    .from("studio_announcements")
    .select(
      `id, title, importance, author_id, created_at,
       profiles:author_id ( full_name, avatar_path )`,
    )
    .eq("published", true)
    .gte("created_at", seit)
    .order("created_at", { ascending: false });

  type PostRow = {
    id: string;
    title: string;
    importance: string;
    author_id: string | null;
    created_at: string;
    profiles: { full_name: string | null; avatar_path: string | null } | null;
  };
  const rows = (posts ?? []) as unknown as PostRow[];

  const dringende = rows.filter((p) => p.importance === "critical").length;

  const counts = new Map<
    string,
    { name: string | null; avatar_path: string | null; posts: number }
  >();
  for (const p of rows) {
    if (!p.author_id) continue;
    const cur = counts.get(p.author_id);
    if (cur) {
      cur.posts += 1;
    } else {
      counts.set(p.author_id, {
        name: p.profiles?.full_name ?? null,
        avatar_path: p.profiles?.avatar_path ?? null,
        posts: 1,
      });
    }
  }

  let aktivste: InfoStats["aktivste_person"] = null;
  let topPosts = 0;
  for (const [id, v] of counts) {
    if (v.posts > topPosts) {
      topPosts = v.posts;
      aktivste = { id, ...v };
    }
  }

  const letzte = rows.slice(0, 3).map((p) => ({
    id: p.id,
    title: p.title,
    author_name: p.profiles?.full_name ?? null,
    avatar_path: p.profiles?.avatar_path ?? null,
    created_at: p.created_at,
  }));

  return {
    posts_diese_woche: rows.length,
    dringende_diese_woche: dringende,
    aktivste_person: aktivste,
    letzte_aktivitaeten: letzte,
  };
}

/**
 * Read-Counts pro Announcement-ID -- "X haben gelesen".
 */
export async function ladeReadCounts(
  ids: string[],
): Promise<Map<string, number>> {
  if (ids.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_announcement_reads")
    .select("announcement_id")
    .in("announcement_id", ids);
  const counts = new Map<string, number>();
  for (const r of (data ?? []) as { announcement_id: string }[]) {
    counts.set(r.announcement_id, (counts.get(r.announcement_id) ?? 0) + 1);
  }
  return counts;
}
