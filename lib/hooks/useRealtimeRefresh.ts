"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Hook der einen Supabase-Realtime-Channel auf eine Tabelle abonniert
 * und bei jedem Event router.refresh() ausloest. Server-Component
 * laedt die Liste neu, alle Skeleton-Wechsel passieren automatisch.
 *
 * Pragmatisch: kein Manual State-Sync, kein Optimistic Merge --
 * einfach refresh wenn was passiert. Reicht fuer das Use-Case
 * "Admin sieht neuen Mangel ohne Reload".
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

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`realtime-${table}-${event}`)
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
  }, [table, event, router]);
}

/**
 * Drop-in Client-Component fuer Server-Pages: macht intern
 * useRealtimeRefresh und rendert nichts. Damit bleibt die
 * eigentliche Page Server-Component.
 *
 * @example
 *   export default async function MaengelPage() {
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
