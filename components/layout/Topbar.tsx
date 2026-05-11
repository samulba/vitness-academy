"use client";

import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { avatarUrlFuerPfad } from "@/lib/storage";
import { Logo } from "@/components/brand/Logo";
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
import { useThemeToggle } from "@/components/ThemeToggle";

type Props = {
  fullName: string | null;
  role: string;
  avatarPath?: string | null;
  notificationSlot?: React.ReactNode;
  standortSlot?: React.ReactNode;
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

export function Topbar({
  fullName,
  role,
  avatarPath,
  notificationSlot,
  standortSlot,
}: Props) {
  const avatarUrl = avatarUrlFuerPfad(avatarPath);
  const theme = useThemeToggle();
  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 lg:hidden">
      <Link
        href="/dashboard"
        className="flex items-center gap-2.5 text-foreground"
      >
        <Logo size={32} priority />
        <span className="hidden text-[15px] font-semibold tracking-tight sm:inline">
          Vitness Crew
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {standortSlot}
        {notificationSlot}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 hover:bg-accent">
          {avatarUrl ? (
            <span className="block h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarUrl}
                alt={fullName ?? "Profilbild"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </span>
          ) : (
            <Avatar>
              <AvatarFallback>{initialen(fullName)}</AvatarFallback>
            </Avatar>
          )}
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-medium leading-none">{fullName ?? "Mitarbeiter"}</span>
            <span className="block text-xs text-muted-foreground">{rolleLabel(role)}</span>
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="font-medium">{fullName ?? "Mitarbeiter"}</div>
            <div className="text-xs text-muted-foreground">{rolleLabel(role)}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/einstellungen" className="w-full">
              <Settings className="h-4 w-4" />
              <span>Einstellungen</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => theme.toggle()}>
            <theme.Icon className="h-4 w-4" />
            <span>{theme.label}</span>
          </DropdownMenuItem>
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
      </div>
    </header>
  );
}
