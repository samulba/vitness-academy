import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Vitness-Crew-Logo-Mark. Erwartet eine Datei unter
 * /public/vitness-crew.png (oder .svg). Default-Variante hat
 * transparenten Hintergrund -- funktioniert auf hellen UND
 * dunklen Containern.
 *
 * Auf sehr dunklem Hintergrund (z.B. Login-Pane oder Landing-
 * Footer) ggf. eine Variante mit hellen Personen-Figuren nutzen
 * (kann später als /public/vitness-crew-light.png dazu).
 */
export function Logo({
  size = 32,
  className,
  alt = "Vitness Crew",
  priority = false,
}: {
  size?: number;
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/vitness-crew.png"
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}
