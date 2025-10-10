import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-9 shrink-0 cursor-pointer items-center rounded-lg border-2 border-border bg-muted p-0.5 transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
    ref={ref}
  >
    <div className="flex gap-0.5 w-full">
      <div
        className={cn(
          "flex-1 flex items-center justify-center px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200",
          "data-[state=unchecked]:bg-destructive data-[state=unchecked]:text-destructive-foreground data-[state=unchecked]:shadow-sm",
          "data-[state=checked]:bg-transparent data-[state=checked]:text-muted-foreground",
        )}
        data-state={props.checked ? "checked" : "unchecked"}
      >
        OFF
      </div>
      <div
        className={cn(
          "flex-1 flex items-center justify-center px-3 py-1 rounded-md text-xs font-semibold transition-all duration-200",
          "data-[state=checked]:bg-success data-[state=checked]:text-success-foreground data-[state=checked]:shadow-sm",
          "data-[state=unchecked]:bg-transparent data-[state=unchecked]:text-muted-foreground",
        )}
        data-state={props.checked ? "checked" : "unchecked"}
      >
        ON
      </div>
    </div>
    <SwitchPrimitives.Thumb className="hidden" />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
