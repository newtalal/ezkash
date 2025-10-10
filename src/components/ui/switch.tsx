import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative inline-flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-200",
      "data-[state=checked]:bg-success data-[state=checked]:border-success",
      "data-[state=unchecked]:bg-muted data-[state=unchecked]:border-muted-foreground/20",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none flex items-center justify-center h-6 w-6 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200",
        "data-[state=checked]:translate-x-7 data-[state=unchecked]:translate-x-0",
      )}
    >
      <span className="text-[8px] font-bold data-[state=checked]:text-success data-[state=unchecked]:text-muted-foreground">
        {props.checked ? "ON" : "OFF"}
      </span>
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
