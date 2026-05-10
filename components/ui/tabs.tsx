"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type TabsCtx = {
  active: string;
  setActive: (id: string) => void;
};

const Ctx = createContext<TabsCtx | null>(null);

function useTabs() {
  const c = useContext(Ctx);
  if (!c) throw new Error("Tab-Komponente ohne <Tabs>-Wrapper verwendet.");
  return c;
}

export function Tabs({
  defaultValue,
  children,
  className,
}: {
  defaultValue: string;
  children: ReactNode;
  className?: string;
}) {
  const [active, setActive] = useState(defaultValue);
  return (
    <Ctx.Provider value={{ active, setActive }}>
      <div className={cn("space-y-6", className)}>{children}</div>
    </Ctx.Provider>
  );
}

export function TabList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function Tab({
  value,
  children,
}: {
  value: string;
  children: ReactNode;
}) {
  const { active, setActive } = useTabs();
  const aktiv = active === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={aktiv}
      onClick={() => setActive(value)}
      className={cn(
        "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
        aktiv
          ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function TabPanel({
  value,
  children,
  className,
  /** Wenn true, wird das Panel ueber `hidden` versteckt statt entladen.
   *  Wichtig wenn Formular-Inputs in mehreren Panels stehen --
   *  unmount wuerde sie aus FormData entfernen.
   */
  keepMounted = false,
}: {
  value: string;
  children: ReactNode;
  className?: string;
  keepMounted?: boolean;
}) {
  const { active } = useTabs();
  const aktiv = active === value;
  if (!aktiv && !keepMounted) return null;
  return (
    <div
      role="tabpanel"
      hidden={!aktiv}
      className={cn("space-y-6", className)}
    >
      {children}
    </div>
  );
}
