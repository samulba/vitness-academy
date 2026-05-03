"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColoredAvatar } from "@/components/admin/ColoredAvatar";
import { INFO_KATEGORIEN } from "@/lib/infos-types";
import { infoPosten } from "./actions";

type Standort = { id: string; name: string };

const FELD = "h-10 rounded-lg";

const IMPORTANCE_DOTS: Record<string, string> = {
  info: "bg-blue-500",
  warning: "bg-amber-500",
};

export function Composer({
  fullName,
  avatarPath,
  vorname,
  standorte,
  defaultLocationId,
}: {
  fullName: string | null;
  avatarPath: string | null;
  vorname: string | null;
  standorte: Standort[];
  defaultLocationId: string | null;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState(false);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>("allgemein");
  const [importance, setImportance] = useState<string>("info");
  const [locationId, setLocationId] = useState<string>(defaultLocationId ?? "");

  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expanded) titleRef.current?.focus();
  }, [expanded]);

  function abbrechen() {
    setExpanded(false);
    setError(null);
    setTitle("");
    setBody("");
    setCategory("allgemein");
    setImportance("info");
    setLocationId(defaultLocationId ?? "");
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("title", title);
    fd.set("body", body);
    fd.set("category", category);
    fd.set("importance", importance);
    fd.set("location_id", locationId);
    startTransition(async () => {
      const res = await infoPosten(fd);
      if (res.ok) {
        setErfolg(true);
        setTitle("");
        setBody("");
        setCategory("allgemein");
        setImportance("info");
        setLocationId(defaultLocationId ?? "");
        setTimeout(() => {
          router.refresh();
          setErfolg(false);
          setExpanded(false);
        }, 1000);
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-card transition-all">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex w-full items-center gap-3 px-5 py-4 text-left"
        >
          <ColoredAvatar
            name={fullName}
            avatarPath={avatarPath}
            size="md"
          />
          <span className="flex-1 truncate rounded-full bg-muted/50 px-4 py-2.5 text-sm text-muted-foreground transition-colors group-hover:bg-muted">
            Was gibt&apos;s Neues
            {vorname ? `, ${vorname}` : ""}?
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
            <Megaphone className="h-4 w-4" strokeWidth={2} />
          </span>
        </button>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <ColoredAvatar
              name={fullName}
              avatarPath={avatarPath}
              size="md"
              className="mt-1"
            />
            <div className="flex-1 space-y-1">
              <Label htmlFor="composer-title" className="text-xs font-medium text-muted-foreground">
                Titel
              </Label>
              <Input
                ref={titleRef}
                id="composer-title"
                name="title"
                required
                minLength={3}
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='z.B. „Sauna heute ab 18 Uhr außer Betrieb"'
                className={FELD}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="composer-body" className="text-xs font-medium text-muted-foreground">
              Details
              <span className="ml-1 font-normal opacity-70">(optional)</span>
            </Label>
            <textarea
              id="composer-body"
              rows={3}
              maxLength={4000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm shadow-sm transition-colors focus-visible:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.2)]"
              placeholder="Kontext, Hintergrund, was zu tun ist …"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Kategorie
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={FELD}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INFO_KATEGORIEN.map((k) => (
                    <SelectItem key={k.value} value={k.value}>
                      {k.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-muted-foreground">
                Wichtigkeit
              </Label>
              <Select value={importance} onValueChange={setImportance}>
                <SelectTrigger className={FELD}>
                  <SelectValue>
                    <span className="inline-flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${IMPORTANCE_DOTS[importance] ?? "bg-blue-500"}`}
                      />
                      {importance === "warning" ? "Wichtig" : "Info"}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      Info — gut zu wissen
                    </span>
                  </SelectItem>
                  <SelectItem value="warning">
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Wichtig — bitte beachten
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {standorte.length > 0 && (
              <div className="space-y-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  Standort
                </Label>
                <Select
                  value={locationId === "" ? "__alle" : locationId}
                  onValueChange={(v) => setLocationId(v === "__alle" ? "" : v)}
                >
                  <SelectTrigger className={FELD}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__alle">Alle Standorte</SelectItem>
                    {standorte.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {error && (
            <p className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
          {erfolg && (
            <p className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--success)/0.12)] px-3 py-2 text-xs font-medium text-[hsl(var(--success))]">
              <Check className="h-3.5 w-3.5" />
              Info gepostet — danke!
            </p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-[11px] text-muted-foreground">
              „Dringend&ldquo; setzt nur die Studioleitung.
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={abbrechen}
                disabled={pending}
                className="h-10 gap-1 rounded-lg text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={pending || title.trim().length < 3}
                className="h-10 gap-2 rounded-lg bg-[hsl(var(--primary))] font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
              >
                <Megaphone className="h-4 w-4" />
                {pending ? "Posten …" : "Posten"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
