"use client";

/**
 * Schmaler Wrapper, der window.print() auslöst. So bleibt die Page
 * eine Server-Component und nur dieser Mini-Button ist Client.
 */
export function PrintTrigger({ children }: { children: React.ReactNode }) {
  return (
    <span onClick={() => window.print()} className="cursor-pointer">
      {children}
    </span>
  );
}
