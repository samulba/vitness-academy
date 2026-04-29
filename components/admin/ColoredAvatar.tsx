import { cn } from "@/lib/utils";

/**
 * Avatar-Initialen mit deterministischer Magenta-Tonsaettigung aus dem Namen.
 * Damit hat jeder Mitarbeiter im Studio einen eigenen Wiedererkennungs-Farbton,
 * aber alle bleiben innerhalb der Magenta-Familie -- keine Regenbogen-Bunte.
 *
 * Verwendung in Tabellen: Avatar links neben dem Titel, ersetzt das oede
 * "graue Initialen-Bubble" Pattern.
 */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

function initialen(name: string | null): string {
  if (!name) return "—";
  const teile = name.split(/\s+/).filter(Boolean).slice(0, 2);
  if (teile.length === 0) return "—";
  return teile.map((p) => p[0]?.toUpperCase()).join("");
}

const SIZES = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-8 w-8 text-[12px]",
  lg: "h-10 w-10 text-[14px]",
} as const;

export function ColoredAvatar({
  name,
  size = "md",
  className,
}: {
  name: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  // Hue-Variation innerhalb der Magenta-Familie: 310-345 deg
  const h = hash(name ?? "?");
  const hue = 310 + (h % 36); // 310..345
  const sat = 60 + (h % 20); // 60..79
  const lig = 50 + (h % 12); // 50..61

  const bg = `hsl(${hue}, ${sat}%, ${lig}%)`;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white shadow-[inset_0_-1px_0_rgba(0,0,0,0.18)]",
        SIZES[size],
        className,
      )}
      style={{ backgroundColor: bg }}
    >
      {initialen(name)}
    </span>
  );
}
