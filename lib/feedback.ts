import { createClient } from "@/lib/supabase/server";
import {
  type Feedback,
  type FeedbackKategorie,
  type Sentiment,
} from "@/lib/feedback-types";

// Re-exports for server-side convenience
export type {
  Feedback,
  FeedbackKategorie,
  Sentiment,
} from "@/lib/feedback-types";
export {
  FEEDBACK_KATEGORIEN,
  istValideKategorie,
  istValidesSentiment,
  kategorieLabel,
} from "@/lib/feedback-types";

const SELECT_COLS = `
  id, location_id, member_name, feedback_text, sentiment, category,
  captured_by, captured_at,
  profiles:captured_by ( full_name )
`;

type Roh = Omit<Feedback, "captured_by_name"> & {
  profiles: { full_name: string | null } | null;
};

function map(r: Roh): Feedback {
  return {
    id: r.id,
    location_id: r.location_id,
    member_name: r.member_name,
    feedback_text: r.feedback_text,
    sentiment: r.sentiment,
    category: r.category,
    captured_by: r.captured_by,
    captured_by_name: r.profiles?.full_name ?? null,
    captured_at: r.captured_at,
  };
}

export async function ladeFeedback(opts?: {
  capturedBy?: string;
  locationId?: string | null;
  sentiment?: Sentiment;
  category?: FeedbackKategorie;
  limit?: number;
}): Promise<Feedback[]> {
  const supabase = await createClient();
  let q = supabase
    .from("member_feedback")
    .select(SELECT_COLS)
    .order("captured_at", { ascending: false });
  if (opts?.capturedBy) q = q.eq("captured_by", opts.capturedBy);
  if (opts?.locationId)
    q = q.or(`location_id.eq.${opts.locationId},location_id.is.null`);
  if (opts?.sentiment) q = q.eq("sentiment", opts.sentiment);
  if (opts?.category) q = q.eq("category", opts.category);
  if (opts?.limit) q = q.limit(opts.limit);
  const { data } = await q;
  return ((data ?? []) as unknown as Roh[]).map(map);
}

export async function feedbackStats(opts?: {
  locationId?: string | null;
}): Promise<{
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  letzte7Tage: number;
}> {
  const supabase = await createClient();
  let q = supabase
    .from("member_feedback")
    .select("sentiment, captured_at");
  if (opts?.locationId)
    q = q.or(`location_id.eq.${opts.locationId},location_id.is.null`);
  const { data } = await q;
  const rows = (data ?? []) as { sentiment: string; captured_at: string }[];
  const seit = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return {
    total: rows.length,
    positive: rows.filter((r) => r.sentiment === "positive").length,
    neutral: rows.filter((r) => r.sentiment === "neutral").length,
    negative: rows.filter((r) => r.sentiment === "negative").length,
    letzte7Tage: rows.filter(
      (r) => new Date(r.captured_at).getTime() >= seit,
    ).length,
  };
}
