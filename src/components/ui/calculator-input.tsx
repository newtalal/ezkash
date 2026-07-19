import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Delete, Calculator } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalculatorInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
  maxDecimals?: number;
  required?: boolean;
}

const isValid = (v: string, maxDecimals: number) => {
  if (v === "") return true;
  const re = new RegExp(`^\\d*\\.?\\d{0,${maxDecimals}}$`);
  return re.test(v);
};

export const CalculatorInput = ({
  value,
  onChange,
  placeholder = "0.00",
  id,
  className,
  maxDecimals = 3,
  required,
}: CalculatorInputProps) => {
  const [open, setOpen] = React.useState(false);

  const append = (ch: string) => {
    if (ch === "." && value.includes(".")) return;
    const next = value + ch;
    if (isValid(next, maxDecimals)) onChange(next);
  };
  const backspace = () => onChange(value.slice(0, -1));
  const clear = () => onChange("");

  const keys = ["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0"];

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        pattern="[0-9]*\.?[0-9]*"
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => {
          if (isValid(e.target.value, maxDecimals)) onChange(e.target.value);
        }}
        className={cn("pr-11", className)}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Open numeric keypad"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <Calculator className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-64 p-3 bg-popover">
          <div className="mb-2 text-right text-lg font-semibold tabular-nums min-h-[1.75rem]">
            {value || "0"}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {keys.map((k) => (
              <Button
                key={k}
                type="button"
                variant="outline"
                onClick={() => append(k)}
                className="h-11 text-base"
              >
                {k}
              </Button>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={backspace}
              className="h-11"
              aria-label="Backspace"
            >
              <Delete className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" onClick={clear} className="h-10">
              Clear
            </Button>
            <Button type="button" onClick={() => setOpen(false)} className="h-10">
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};