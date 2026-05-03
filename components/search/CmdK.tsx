"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpenText,
  Compass,
  GraduationCap,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { globaleSuche, type SuchTreffer } from "@/lib/suche";

type Eintrag = {
  href: string;
  label: string;
  unter: string;
  group: "Lernpfade" | "Lektionen" | "Handbuch";
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

function ergebnisseZuListe(t: SuchTreffer): Eintrag[] {
  const out: Eintrag[] = [];
  for (const p of t.lernpfade) {
    out.push({
      href: `/lernpfade/${p.id}`,
      label: p.title,
      unter: "Lernpfad",
      group: "Lernpfade",
      icon: Compass,
    });
  }
  for (const l of t.lektionen) {
    out.push({
      href: `/lektionen/${l.id}`,
      label: l.title,
      unter: `${l.path_title} · ${l.module_title}`,
      group: "Lektionen",
      icon: GraduationCap,
    });
  }
  for (const a of t.artikel) {
    out.push({
      href: `/wissen/${a.slug}`,
      label: a.title,
      unter: a.category_name ?? "Handbuch",
      group: "Handbuch",
      icon: BookOpenText,
    });
  }
  return out;
}

export function CmdK() {
  const router = useRouter();
  const [offen, setOffen] = useState(false);
  const [query, setQuery] = useState("");
  const [treffer, setTreffer] = useState<SuchTreffer>({
    lernpfade: [],
    lektionen: [],
    artikel: [],
  });
  const [aktiv, setAktiv] = useState(0);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // Hotkey: Cmd+K / Ctrl+K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOffen((v) => !v);
      } else if (e.key === "Escape" && offen) {
        setOffen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [offen]);

  // Custom Event: trigger from Sidebar-Button
  useEffect(() => {
    function open() {
      setOffen(true);
    }
    window.addEventListener("vitness:open-search", open);
    return () => window.removeEventListener("vitness:open-search", open);
  }, []);

  // Focus input on open
  useEffect(() => {
    if (offen) {
      setTimeout(() => inputRef.current?.focus(), 30);
    } else {
      setQuery("");
      setTreffer({ lernpfade: [], lektionen: [], artikel: [] });
      setAktiv(0);
    }
  }, [offen]);

  // Debounced search
  useEffect(() => {
    if (!offen) return;
    if (query.trim().length < 2) {
      setTreffer({ lernpfade: [], lektionen: [], artikel: [] });
      return;
    }
    let cancelled = false;
    const id = setTimeout(() => {
      startTransition(async () => {
        const res = await globaleSuche(query);
        if (cancelled) return;
        setTreffer(res);
        setAktiv(0);
      });
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [query, offen]);

  const liste = useMemo(() => ergebnisseZuListe(treffer), [treffer]);

  const navigateTo = useCallback(
    (href: string) => {
      setOffen(false);
      router.push(href);
    },
    [router],
  );

  // Keyboard nav within results
  function onInputKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAktiv((a) => Math.min(liste.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setAktiv((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      const t = liste[aktiv];
      if (t) {
        e.preventDefault();
        navigateTo(t.href);
      }
    }
  }

  if (!offen) return null;

  let lastGroup = "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Suche"
      className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-[15vh]"
    >
      <div
        aria-hidden
        onClick={() => setOffen(false)}
        className="absolute inset-0 bg-[hsl(var(--brand-ink)/0.6)] backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-[0_30px_80px_-30px_hsl(var(--brand-ink)/0.5)]">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Lernpfade, Lektionen, Handbuch durchsuchen…"
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
          />
          <button
            type="button"
            onClick={() => setOffen(false)}
            className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
          >
            Esc
          </button>
        </div>

        {/* Ergebnisse */}
        <div className="max-h-[60vh] overflow-y-auto">
          {query.trim().length < 2 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
              <Search className="h-5 w-5" />
              <p>
                Tipp ein Stichwort — du findest Lernpfade, Lektionen und
                Handbuch-Artikel auf einmal.
              </p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs">
                Hotkey
                <span className="rounded border border-border bg-background px-1.5 font-mono">
                  ⌘K
                </span>
                /
                <span className="rounded border border-border bg-background px-1.5 font-mono">
                  Ctrl+K
                </span>
              </p>
            </div>
          ) : pending && liste.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              Suche…
            </div>
          ) : liste.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-sm text-muted-foreground">
              <X className="h-5 w-5" />
              <p>
                Keine Treffer für „{query}“. Versuch ein anderes Stichwort.
              </p>
            </div>
          ) : (
            <ul className="py-2">
              {liste.map((e, i) => {
                const headerNoetig = e.group !== lastGroup;
                lastGroup = e.group;
                return (
                  <li key={`${e.group}-${e.href}-${i}`}>
                    {headerNoetig && (
                      <div className="px-5 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {e.group}
                      </div>
                    )}
                    <button
                      type="button"
                      onMouseEnter={() => setAktiv(i)}
                      onClick={() => navigateTo(e.href)}
                      className={cn(
                        "flex w-full items-center gap-4 px-5 py-2.5 text-left transition-colors",
                        i === aktiv
                          ? "bg-[hsl(var(--primary)/0.08)]"
                          : "hover:bg-muted/50",
                      )}
                    >
                      <span
                        className={cn(
                          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background transition-colors",
                          i === aktiv
                            ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                            : "text-muted-foreground",
                        )}
                      >
                        <e.icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {e.label}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {e.unter}
                        </p>
                      </div>
                      {i === aktiv && (
                        <ArrowRight className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/40 px-5 py-2.5 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono">
                ↑
              </kbd>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono">
                ↓
              </kbd>
              wechseln
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono">
                ↵
              </kbd>
              öffnen
            </span>
          </div>
          <span>Vitness Suche</span>
        </div>
      </div>
    </div>
  );
}
