import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex h-12 w-8 shrink-0 cursor-pointer items-center rounded-md border-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] transition-all duration-300",
      "data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-primary/90 data-[state=checked]:to-primary data-[state=checked]:border-primary/50",
      "data-[state=unchecked]:bg-gradient-to-b data-[state=unchecked]:from-muted data-[state=unchecked]:to-muted/80 data-[state=unchecked]:border-border",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-5 w-6 mx-auto rounded-sm bg-background shadow-[0_2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.5)] ring-0 transition-all duration-300",
        "data-[state=checked]:translate-y-[14px] data-[state=unchecked]:translate-y-[-14px]",
        "data-[state=checked]:bg-gradient-to-b data-[state=checked]:from-background data-[state=checked]:to-background/90",
        "data-[state=unchecked]:bg-gradient-to-b data-[state=unchecked]:from-muted-foreground/80 data-[state=unchecked]:to-muted-foreground/60",
        "relative",
        "before:absolute before:inset-0 before:rounded-sm before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
