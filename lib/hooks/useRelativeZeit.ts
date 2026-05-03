"use client";

import { useEffect, useState } from "react";

/**
 * Hydration-sicher: Server rendert leeren String (oder Fallback),
 * Client setzt nach Mount den realen Wert. Re-Render alle 60s damit
 * sich "vor 5 Min" -> "vor 6 Min" automatisch updated.
 *
 * Warum nicht direkt im Render: Date.now() liefert auf Server/Client
 * unterschiedliche Werte -> Hydration-Mismatch -> Whitescreen.
 */
export function useRelativeZeit(iso: string | null | undefined): string {
  const [zeit, setZeit] = useState<string>("");

  useEffect(() => {
    if (!iso) {
      setZeit("");
      return;
    }
    setZeit(berechne(iso));
    const id = setInterval(() => setZeit(berechne(iso)), 60_000);
    return () => clearInterval(id);
  }, [iso]);

  return zeit;
}

function berechne(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60_000);
  if (min < 1) return "gerade eben";
  if (min < 60) return `vor ${min} Min`;
  const std = Math.floor(min / 60);
  if (std < 24) return `vor ${std} Std`;
  const tage = Math.floor(std / 24);
  if (tage < 7) return `vor ${tage} Tg`;
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}
