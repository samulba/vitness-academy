"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  CheckSquare,
  FileText,
  ListTodo,
  Megaphone,
  MessageCircle,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  alleNotificationsGelesen,
  notificationGelesen,
} from "@/app/(app)/notifications/actions";
import {
  iconKey,
  relativeZeit,
  type Notification,
  type NotificationType,
} from "@/lib/notifications-types";

const ICON_MAP = {
  wrench: Wrench,
  "file-text": FileText,
  "check-square": CheckSquare,
  "list-todo": ListTodo,
  megaphone: Megaphone,
  "message-circle": MessageCircle,
  bell: Bell,
} as const;

function IconFuerType({ type }: { type: NotificationType }) {
  const key = iconKey(type) as keyof typeof ICON_MAP;
  const Icon = ICON_MAP[key] ?? Bell;
  return <Icon className="h-3.5 w-3.5" />;
}

/**
 * Bell-Icon mit Counter-Badge fuer ungelesene Notifications.
 * Bei Klick oeffnet sich ein Popover-Sheet rechts mit der Liste.
 *
 * Wird in Topbar (mobile) + Sidebar (desktop, optional) eingebunden.
 * Erhaelt initiale Daten als Server-Component-Render-Result, der
 * Counter wird via revalidatePath nach jeder Server-Action erneuert.
 */
export function NotificationBell({
  notifications,
  ungeleseneAnzahl,
}: {
  notifications: Notification[];
  ungeleseneAnzahl: number;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Klick außerhalb schließt das Popover
  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Esc schließt
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={
          ungeleseneAnzahl > 0
            ? `${ungeleseneAnzahl} ungelesene Benachrichtigungen`
            : "Benachrichtigungen"
        }
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-[hsl(var(--brand-pink)/0.4)] hover:text-foreground"
      >
        <Bell className="h-4 w-4" strokeWidth={1.75} />
        {ungeleseneAnzahl > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--primary))] px-1 text-[10px] font-bold leading-none text-[hsl(var(--primary-foreground))]">
            {ungeleseneAnzahl > 9 ? "9+" : ungeleseneAnzahl}
          </span>
        )}
        {ungeleseneAnzahl > 0 && (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 inline-flex h-4 w-4 animate-ping rounded-full bg-[hsl(var(--primary))] opacity-50"
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-[13px] font-semibold tracking-tight">
              Benachrichtigungen
            </p>
            {ungeleseneAnzahl > 0 && (
              <form action={alleNotificationsGelesen}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <CheckCheck className="h-3 w-3" />
                  Alle als gelesen
                </button>
              </form>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <span
                  aria-hidden
                  className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]"
                >
                  <Bell className="h-4 w-4" />
                </span>
                <p className="text-[13px] font-medium">Alles ruhig</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  Du wirst benachrichtigt, sobald sich was tut.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    n={n}
                    onClick={() => setOpen(false)}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({
  n,
  onClick,
}: {
  n: Notification;
  onClick: () => void;
}) {
  const istUngelesen = !n.read_at;

  function markRead() {
    if (!istUngelesen) return;
    notificationGelesen(n.id).catch(() => {});
  }

  const inhalt = (
    <>
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          istUngelesen
            ? "bg-[hsl(var(--brand-pink)/0.12)] text-[hsl(var(--brand-pink))]"
            : "bg-muted text-muted-foreground",
        )}
      >
        <IconFuerType type={n.type} />
      </span>
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px] leading-snug",
            istUngelesen ? "font-semibold text-foreground" : "text-muted-foreground",
          )}
        >
          {n.title}
        </p>
        {n.body && (
          <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">
            {n.body}
          </p>
        )}
        <p className="mt-1 text-[10px] text-muted-foreground/70">
          {relativeZeit(n.created_at)}
        </p>
      </div>
      {istUngelesen && (
        <span
          aria-hidden
          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--brand-pink))]"
        />
      )}
    </>
  );

  if (n.link) {
    return (
      <li>
        <Link
          href={n.link}
          onClick={() => {
            markRead();
            onClick();
          }}
          className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-[hsl(var(--brand-pink)/0.04)]"
        >
          {inhalt}
        </Link>
      </li>
    );
  }
  return (
    <li>
      <button
        type="button"
        onClick={() => {
          markRead();
          onClick();
        }}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[hsl(var(--brand-pink)/0.04)]"
      >
        {inhalt}
      </button>
    </li>
  );
}
