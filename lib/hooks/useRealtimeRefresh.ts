"use client";

import { useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook der einen Supabase-Realtime-Channel auf eine Tabelle abonniert
 * und bei jedem Event router.refresh() ausloest. Server-Component
 * laedt die Liste neu, alle Skeleton-Wechsel passieren automatisch.
 *
 * Pragmatisch: kein Manual State-Sync, kein Optimistic Merge --
 * einfach refresh wenn was passiert. Reicht für das Use-Case
 * "Admin sieht neuen Mangel ohne Reload".
 *
 * Channel-Name enthält useId(), damit mehrere Instances derselben
 * Subscription nebeneinander leben können (z.B. Bell in Topbar + Sidebar).
 *
 * @example
 *   <RealtimeRefresh table="studio_issues" />
 *   <RealtimeRefresh table="form_submissions" event="INSERT" />
 */
export function useRealtimeRefresh(
  table: string,
  event: "*" | "INSERT" | "UPDATE" | "DELETE" = "*",
) {
  const router = useRouter();
  const id = useId();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-${table}-${event}-${id}`)
      .on(
        "postgres_changes",
        {
          event,
          schema: "public",
          table,
        },
        () => {
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, router, id]);
}

/**
 * Drop-in Client-Component für Server-Pages: macht intern
 * useRealtimeRefresh und rendert nichts. Damit bleibt die
 * eigentliche Page Server-Component.
 *
 * @example
 *   export default async function MängelPage() {
 *     const data = await ladeMaengel(...);
 *     return (
 *       <>
 *         <RealtimeRefresh table="studio_issues" />
 *         <DataTable data={data} ... />
 *       </>
 *     );
 *   }
 */
export function RealtimeRefresh({
  table,
  event = "*",
}: {
  table: string;
  event?: "*" | "INSERT" | "UPDATE" | "DELETE";
}) {
  useRealtimeRefresh(table, event);
  return null;
}
