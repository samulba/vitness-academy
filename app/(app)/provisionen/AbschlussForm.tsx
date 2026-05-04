"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Check, Plus } from "lucide-react";
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
import {
  LAUFZEIT_OPTIONS,
  type CommissionRate,
  type Laufzeit,
  berechneProvision,
  formatEuro,
} from "@/lib/provisionen-types";
import { abschlussAnlegen } from "./actions";

const FELD = "h-10 rounded-lg";

function heuteIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseEuro(s: string): number {
  const cleaned = s.trim().replace(/\./g, "").replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

export function AbschlussForm({ rates }: { rates: CommissionRate[] }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [erfolg, setErfolg] = useState(false);

  const [datum, setDatum] = useState(heuteIso());
  const [laufzeit, setLaufzeit] = useState<Laufzeit>("104");
  const [beitragNetto, setBeitragNetto] = useState("0,00");
  const [startpaket, setStartpaket] = useState("0,00");

  // Live-Vorschau Provision
  const [vorschau, setVorschau] = useState(0);
  useEffect(() => {
    setVorschau(
      berechneProvision(
        {
          laufzeit,
          datum,
          beitrag_netto: parseEuro(beitragNetto),
          startpaket: parseEuro(startpaket),
        },
        rates,
      ),
    );
  }, [laufzeit, datum, beitragNetto, startpaket, rates]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("laufzeit", laufzeit);
    startTransition(async () => {
      const res = await abschlussAnlegen(fd);
      if (res.ok) {
        setErfolg(true);
        formRef.current?.reset();
        setDatum(heuteIso());
        setLaufzeit("104");
        setBeitragNetto("0,00");
        setStartpaket("0,00");
        setTimeout(() => {
          router.refresh();
          setErfolg(false);
        }, 1200);
      } else {
        setError(res.message);
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="datum">Datum</Label>
          <Input
            id="datum"
            name="datum"
            type="date"
            required
            value={datum}
            onChange={(e) => setDatum(e.target.value)}
            className={FELD}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Laufzeit</Label>
          <Select
            value={laufzeit}
            onValueChange={(v) => setLaufzeit(v as Laufzeit)}
          >
            <SelectTrigger className={FELD}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LAUFZEIT_OPTIONS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="mitglied_name">Mitglied (Name)</Label>
          <Input
            id="mitglied_name"
            name="mitglied_name"
            required
            minLength={2}
            maxLength={120}
            placeholder='z.B. Patrick Heimann'
            className={FELD}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mitglied_nummer">
            Mitgliedsnummer{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="mitglied_nummer"
            name="mitglied_nummer"
            maxLength={40}
            placeholder="z.B. 2-1028280"
            className={FELD}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="beitrag_14taegig">Beitrag 14-tägig</Label>
          <Input
            id="beitrag_14taegig"
            name="beitrag_14taegig"
            inputMode="decimal"
            placeholder="0,00"
            className={FELD}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="beitrag_netto">Beitrag Netto</Label>
          <Input
            id="beitrag_netto"
            name="beitrag_netto"
            inputMode="decimal"
            value={beitragNetto}
            onChange={(e) => setBeitragNetto(e.target.value)}
            placeholder="0,00"
            className={FELD}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="startpaket">Startpaket</Label>
          <Input
            id="startpaket"
            name="startpaket"
            inputMode="decimal"
            value={startpaket}
            onChange={(e) => setStartpaket(e.target.value)}
            placeholder="0,00"
            className={FELD}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="getraenke_soli">Getränke + Soli</Label>
          <Input
            id="getraenke_soli"
            name="getraenke_soli"
            inputMode="decimal"
            placeholder="0,00"
            className={FELD}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bemerkung">
          Bemerkung{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="bemerkung"
          name="bemerkung"
          maxLength={200}
          placeholder='z.B. "mit Feelfit"'
          className={FELD}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="space-y-0.5">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Vorschau Provision
          </p>
          <p className="text-2xl font-bold tabular-nums text-[hsl(var(--brand-pink))]">
            {formatEuro(vorschau)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {error && (
            <p className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--destructive)/0.1)] px-3 py-2 text-xs font-medium text-[hsl(var(--destructive))]">
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </p>
          )}
          {erfolg && (
            <p className="inline-flex items-center gap-2 rounded-lg bg-[hsl(var(--success)/0.12)] px-3 py-2 text-xs font-medium text-[hsl(var(--success))]">
              <Check className="h-3.5 w-3.5" />
              Eingetragen
            </p>
          )}
          <Button
            type="submit"
            disabled={pending}
            className="h-10 gap-2 rounded-lg bg-[hsl(var(--primary))] font-medium text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary)/0.9)]"
          >
            <Plus className="h-4 w-4" />
            {pending ? "Sende …" : "Abschluss eintragen"}
          </Button>
        </div>
      </div>
    </form>
  );
}
