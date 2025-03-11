
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-tacktix-blue text-white hover:bg-tacktix-blue-dark",
        secondary:
          "border-transparent bg-tacktix-dark-light text-white hover:bg-tacktix-dark",
        destructive:
          "border-transparent bg-tacktix-red text-white hover:bg-tacktix-red-dark",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-600 text-white hover:bg-green-700",
        badge: "bg-gradient-to-r from-tacktix-blue/10 to-tacktix-blue/20 text-tacktix-blue hover:from-tacktix-blue/20 hover:to-tacktix-blue/30 border border-tacktix-blue/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
