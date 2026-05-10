"use client";

import { useEffect, useState } from "react";

/**
 * Client-side Begrüßung -- new Date().getHours() laeuft im Browser
 * mit der User-Timezone, nicht mit Server-TZ. Verhindert "Guten Morgen
 * um 04:00 Lokalzeit" weil Server in UTC laeuft.
 *
 * Initialer Wert ist deterministisch ("Hallo, …"), damit kein
 * Hydration-Mismatch entsteht. Nach Mount wird der reale Gruss gesetzt.
 */
export function Tageszeitgruss({ name }: { name: string | null }) {
  const vorname = name?.split(" ")[0] ?? null;
  const titel = vorname ?? "willkommen";
  const fallback = `Hallo, ${titel}`;
  const [gruss, setGruss] = useState<string>(fallback);

  useEffect(() => {
    const stunde = new Date().getHours();
    if (stunde < 5) setGruss(`Schön, dass du da bist, ${titel}`);
    else if (stunde < 11) setGruss(`Guten Morgen, ${titel}`);
    else if (stunde < 18) setGruss(`Hallo, ${titel}`);
    else if (stunde < 22) setGruss(`Guten Abend, ${titel}`);
    else setGruss(`Schön, dass du da bist, ${titel}`);
  }, [titel]);

  return <>{gruss}</>;
}
