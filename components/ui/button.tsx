import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Konsistenter Button für das gesamte Admin-Panel.
 *
 * Varianten:
 *  - primary   Magenta-Fill, für die Haupt-Action der Page
 *  - secondary Border-Only, für alle nicht-primaeren Aktionen
 *  - ghost     Nur Hover-Tint, für subtile Aktionen in Toolbars
 *  - icon      Quadratischer Icon-Button (h=w=8)
 *
 * Alte shadcn-Varianten (default/outline/destructive/success/link) bleiben
 * für Backwards-Compat erhalten -- werden in der Migration weggebaut.
 *
 * Alle Buttons haben transition + active:scale-[0.98] für das taktile
 * Linear/Vercel-Feeling.
 *
 * @example
 *   <Button variant="primary">Speichern</Button>
 *   <Button variant="secondary" asChild>
 *     <Link href="/foo">Zu Foo</Link>
 *   </Button>
 *   <Button variant="icon" aria-label="Löschen">
 *     <Trash2 />
 *   </Button>
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[13px] font-medium",
    "transition active:scale-[0.98] motion-reduce:active:scale-100",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:size-3.5 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary:
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_1px_0_0_rgba(0,0,0,0.08)] hover:bg-[hsl(var(--primary)/0.92)]",
        secondary:
          "border border-border bg-background text-foreground hover:border-[hsl(var(--brand-pink)/0.4)] hover:bg-muted/40",
        ghost:
          "text-muted-foreground hover:bg-muted hover:text-foreground",
        icon: "text-muted-foreground hover:bg-muted hover:text-foreground",

        // Backwards-Compat (Aliasse)
        default:
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm hover:bg-[hsl(var(--primary))/0.9]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        success:
          "bg-success text-success-foreground shadow-sm hover:bg-success/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-8 px-3",
        sm: "h-7 rounded-md px-2.5 text-xs",
        lg: "h-9 rounded-md px-4 text-sm",
        icon: "h-8 w-8 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    // size="icon" + variant="icon": auto-set für Convenience
    const finalSize = variant === "icon" && !size ? "icon" : size;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size: finalSize, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
