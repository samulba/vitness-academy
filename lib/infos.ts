import { createClient } from "@/lib/supabase/server";

export type Importance = "info" | "warning" | "critical";

export type Announcement = {
  id: string;
  location_id: string | null;
  title: string;
  body: string;
  importance: Importance;
  pinned: boolean;
  published: boolean;
  author_id: string | null;
  author_name: string | null;
  created_at: string;
  updated_at: string;
};

type Roh = {
  id: string;
  location_id: string | null;
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
  return {
    id: r.id,
    location_id: r.location_id,
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

export async function ladeAnnouncements(opts?: {
  nurPublished?: boolean;
}): Promise<Announcement[]> {
  const supabase = await createClient();
  let q = supabase
    .from("studio_announcements")
    .select(
      `id, location_id, title, body, importance, pinned, published,
       author_id, created_at, updated_at,
       profiles:author_id ( full_name )`,
    )
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
    .select(
      `id, location_id, title, body, importance, pinned, published,
       author_id, created_at, updated_at,
       profiles:author_id ( full_name )`,
    )
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
 * Erste ungelesene + warning/critical Announcement (fuer Dashboard-Banner).
 */
export async function aktiveBannerInfo(
  userId: string,
): Promise<Announcement | null> {
  const [alle, gelesen] = await Promise.all([
    ladeAnnouncements({ nurPublished: true }),
    ladeReadIds(userId),
  ]);
  const ungelesen = alle.filter(
    (a) =>
      !gelesen.has(a.id) &&
      (a.importance === "warning" || a.importance === "critical"),
  );
  return ungelesen[0] ?? null;
}
