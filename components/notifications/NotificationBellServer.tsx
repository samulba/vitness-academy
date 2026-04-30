import { ladeNotifications, ungeleseneAnzahl } from "@/lib/notifications";
import { getCurrentProfile } from "@/lib/auth";
import { NotificationBell } from "./NotificationBell";

/**
 * Server-Component-Wrapper. Laedt Notifications + ungelesene Anzahl
 * und reicht sie an den Client-Bell weiter. Eingebunden in Topbar
 * und Sidebar.
 *
 * Bei jeder Server-Action mit revalidatePath('/', 'layout') wird die
 * Komponente neu gerendered und der Counter aktualisiert.
 */
export async function NotificationBellServer() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [notifications, anzahl] = await Promise.all([
    ladeNotifications(profile.id, 30),
    ungeleseneAnzahl(profile.id),
  ]);

  return (
    <NotificationBell
      notifications={notifications}
      ungeleseneAnzahl={anzahl}
    />
  );
}
