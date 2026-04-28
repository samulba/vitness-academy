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
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t bg-card/95 backdrop-blur lg:hidden">
      {links.map(({ href, label, icon: Icon }) => {
        const aktiv =
          pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2 text-xs",
              aktiv ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
