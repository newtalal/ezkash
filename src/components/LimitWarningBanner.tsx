import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCategoryBudgets } from "@/hooks/useCategoryBudgets";

interface OverBudget {
  category: string;
  spent: number;
  limit: number;
}

const SESSION_KEY = "easycash_dismissed_budget_warnings";

function getDismissed(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "[]");
  } catch {
    return [];
  }
}

export const LimitWarningBanner = () => {
  const { budgets } = useCategoryBudgets();
  const [warnings, setWarnings] = useState<OverBudget[]>([]);
  const [dismissed, setDismissed] = useState<string[]>(getDismissed());

  useEffect(() => {
    if (budgets.length === 0) {
      setWarnings([]);
      return;
    }
    const compute = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("transactions")
        .select("category, amount")
        .eq("user_id", user.id)
        .gte("date", start.toISOString());
      const totals: Record<string, number> = {};
      (data || []).forEach((r: any) => {
        totals[r.category] = (totals[r.category] || 0) + Number(r.amount);
      });
      const over: OverBudget[] = budgets
        .filter((b) => (totals[b.category] || 0) >= b.monthlyLimit && b.monthlyLimit > 0)
        .map((b) => ({
          category: b.category,
          spent: totals[b.category] || 0,
          limit: b.monthlyLimit,
        }));
      setWarnings(over);
    };
    compute();
  }, [budgets]);

  const visible = warnings.filter((w) => !dismissed.includes(w.category));
  if (visible.length === 0) return null;

  const dismiss = (category: string) => {
    const next = [...dismissed, category];
    setDismissed(next);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
  };

  return (
    <div className="space-y-2">
      {visible.map((w) => (
        <div
          key={w.category}
          className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-3"
        >
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <span className="font-medium text-destructive">Over budget: </span>
            You've exceeded your <strong>{w.category}</strong> budget this month (
            {w.spent.toFixed(3)} / {w.limit.toFixed(3)} KWD).
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => dismiss(w.category)}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};