import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Prüft ob ein String einer gueltigen UUID v1-v5 entspricht.
 * Schuetzt Server-Actions vor manipulierten Form-Posts, die sonst
 * Postgres mit ungueltigen Casts crashen lassen würden.
 */
export function istUUID(value: unknown): value is string {
  return typeof value === "string" && UUID_REGEX.test(value);
}
