"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { abmelden } from "@/app/login/actions";
import { rolleLabel } from "@/lib/format";

type Props = {
  fullName: string | null;
  role: string;
};

function initialen(name: string | null): string {
  if (!name) return "VA";
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function Topbar({ fullName, role }: Props) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
        <span className="brand-gradient inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-bold text-white shadow-md">
          VA
        </span>
        <span className="hidden sm:inline">Vitness Academy</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 hover:bg-accent">
          <Avatar>
            <AvatarFallback>{initialen(fullName)}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <div className="text-sm font-medium leading-none">{fullName ?? "Mitarbeiter"}</div>
            <div className="text-xs text-muted-foreground">{rolleLabel(role)}</div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="font-medium">{fullName ?? "Mitarbeiter"}</div>
            <div className="text-xs text-muted-foreground">{rolleLabel(role)}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <form action={abmelden}>
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full text-left">
                <LogOut className="h-4 w-4" />
                <span>Abmelden</span>
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
