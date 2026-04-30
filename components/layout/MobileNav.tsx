"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, GraduationCap, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { istFuehrungskraftOderHoeher, type Rolle } from "@/lib/rollen";

export function MobileNav({ rolle }: { rolle: Rolle }) {
  const pathname = usePathname();
  const zeigeAdmin = istFuehrungskraftOderHoeher(rolle);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/lernpfade", label: "Lernpfade", icon: GraduationCap },
    ...(zeigeAdmin
      ? [{ href: "/admin", label: "Verwaltung", icon: ShieldCheck }]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-card/95 backdrop-blur lg:hidden">
      {links.map(({ href, label, icon: Icon }) => {
        const aktiv =
          pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors",
              aktiv
                ? "text-[hsl(var(--primary))]"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {aktiv && (
              <span
                aria-hidden
                className="absolute left-1/2 top-0 h-[2px] w-8 -translate-x-1/2 rounded-b-full bg-[hsl(var(--primary))]"
              />
            )}
            <Icon className="h-4 w-4" strokeWidth={1.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
