"use client";

import { useEffect, useState } from "react";

const TAGE = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
];
const MONATE = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

/**
 * Datum mit User-Timezone (Browser). Server-Render in UTC wuerde am
 * spaeten Abend einen Tag voraus zeigen -> Hydration-Mismatch. Daher
 * client-only mit useEffect.
 */
export function Heutedatum() {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const d = new Date();
    setText(`${TAGE[d.getDay()]}, ${d.getDate()}. ${MONATE[d.getMonth()]}`);
  }, []);

  return <>{text}</>;
}
