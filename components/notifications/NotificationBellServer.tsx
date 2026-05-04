import { ladeNotifications, ungeleseneAnzahl } from "@/lib/notifications";
import { getCurrentProfile } from "@/lib/auth";
import { RealtimeRefresh } from "@/lib/hooks/useRealtimeRefresh";
import { NotificationBell } from "./NotificationBell";

/**
 * Server-Component-Wrapper. Laedt Notifications + ungelesene Anzahl
 * und reicht sie an den Client-Bell weiter.
 *
 * `placement` steuert, wo das Popover sich oeffnet:
 *   - "auto" (default): unter Bell, rechtsbuendig -- fuer Topbar mobile
 *   - "side-right": rechts neben Bell -- fuer Sidebar (380px-Popover
 *     passt sonst nicht in 240px-Sidebar)
 */
export async function NotificationBellServer({
  placement = "auto",
}: {
  placement?: "auto" | "side-right";
} = {}) {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [notifications, anzahl] = await Promise.all([
    ladeNotifications(profile.id, 30),
    ungeleseneAnzahl(profile.id),
  ]);

  return (
    <>
      <RealtimeRefresh table="notifications" event="INSERT" />
      <NotificationBell
        notifications={notifications}
        ungeleseneAnzahl={anzahl}
        placement={placement}
      />
    </>
  );
}
