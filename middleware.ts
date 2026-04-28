import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Alle Routen ausser:
     *   - _next/static (statisches Build-Artefakt)
     *   - _next/image (Next-Bildoptimierung)
     *   - favicon.ico, public/*
     *   - Bild-/Font-Dateien
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
