import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Filter, CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export type RangePreset = "all" | "this-month" | "last-month" | "last-3-months" | "custom";

export interface FilterState {
  preset: RangePreset;
  from?: Date;
  to?: Date;
  categories: string[];
  paymentMethods: string[];
}

export const defaultFilters: FilterState = {
  preset: "all",
  categories: [],
  paymentMethods: [],
};

interface Props {
  value: FilterState;
  onChange: (state: FilterState) => void;
  categories: string[];
  paymentMethods: string[];
}

const presetLabels: Record<RangePreset, string> = {
  all: "All time",
  "this-month": "This month",
  "last-month": "Last month",
  "last-3-months": "Last 3 months",
  custom: "Custom",
};

export const FilterBar = ({ value, onChange, categories, paymentMethods }: Props) => {
  const [open, setOpen] = useState(false);

  const activeCount = useMemo(() => {
    let n = 0;
    if (value.preset !== "all") n++;
    if (value.categories.length) n++;
    if (value.paymentMethods.length) n++;
    return n;
  }, [value]);

  const toggle = (list: string[], item: string) =>
    list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

  const clearAll = () => onChange(defaultFilters);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          className="gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
              {activeCount}
            </span>
          )}
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1 text-muted-foreground">
            <X className="w-3 h-3" /> Clear
          </Button>
        )}
      </div>

      {open && (
        <Card className="p-4 space-y-4">
          {/* Date range preset */}
          <div className="space-y-2">
            <Label className="text-xs">Date range</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(presetLabels) as RangePreset[]).map((p) => (
                <Button
                  key={p}
                  size="sm"
                  variant={value.preset === p ? "default" : "outline"}
                  onClick={() => onChange({ ...value, preset: p })}
                >
                  {presetLabels[p]}
                </Button>
              ))}
            </div>
            {value.preset === "custom" && (
              <div className="flex flex-wrap gap-2 pt-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("gap-2", !value.from && "text-muted-foreground")}>
                      <CalendarIcon className="w-4 h-4" />
                      {value.from ? format(value.from, "dd-MM-yyyy") : "From"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={value.from}
                      onSelect={(d) => onChange({ ...value, from: d || undefined })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className={cn("gap-2", !value.to && "text-muted-foreground")}>
                      <CalendarIcon className="w-4 h-4" />
                      {value.to ? format(value.to, "dd-MM-yyyy") : "To"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={value.to}
                      onSelect={(d) => onChange({ ...value, to: d || undefined })}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label className="text-xs">Categories</Label>
            {categories.length === 0 ? (
              <p className="text-xs text-muted-foreground">No categories</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {categories.map((c) => (
                  <label
                    key={c}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2 py-1 text-xs cursor-pointer",
                      value.categories.includes(c) && "bg-primary/10 border-primary"
                    )}
                  >
                    <Checkbox
                      checked={value.categories.includes(c)}
                      onCheckedChange={() =>
                        onChange({ ...value, categories: toggle(value.categories, c) })
                      }
                    />
                    {c}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment methods */}
          <div className="space-y-2">
            <Label className="text-xs">Payment methods</Label>
            {paymentMethods.length === 0 ? (
              <p className="text-xs text-muted-foreground">No accounts</p>
            ) : (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {paymentMethods.map((p) => (
                  <label
                    key={p}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2 py-1 text-xs cursor-pointer",
                      value.paymentMethods.includes(p) && "bg-primary/10 border-primary"
                    )}
                  >
                    <Checkbox
                      checked={value.paymentMethods.includes(p)}
                      onCheckedChange={() =>
                        onChange({ ...value, paymentMethods: toggle(value.paymentMethods, p) })
                      }
                    />
                    {p}
                  </label>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export function applyFilters<T extends { date: Date; category: string; paymentMethod: string }>(
  transactions: T[],
  filters: FilterState
): T[] {
  let from: Date | undefined;
  let to: Date | undefined;
  const now = new Date();

  switch (filters.preset) {
    case "this-month":
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case "last-month":
      from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case "last-3-months":
      from = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case "custom":
      from = filters.from;
      to = filters.to
        ? new Date(
            filters.to.getFullYear(),
            filters.to.getMonth(),
            filters.to.getDate(),
            23,
            59,
            59,
            999
          )
        : undefined;
      break;
  }

  return transactions.filter((t) => {
    if (from && t.date < from) return false;
    if (to && t.date > to) return false;
    if (filters.categories.length && !filters.categories.includes(t.category)) return false;
    if (
      filters.paymentMethods.length &&
      !filters.paymentMethods.includes(t.paymentMethod)
    )
      return false;
    return true;
  });
}