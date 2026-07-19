import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, Target } from "lucide-react";
import { toast } from "sonner";
import { useCategoryBudgets } from "@/hooks/useCategoryBudgets";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface Props {
  categories: string[];
}

interface MonthSpend {
  [category: string]: number;
}

export const CategoryBudgetsCard = ({ categories }: Props) => {
  const { budgets, upsertBudget, deleteBudget, loading } = useCategoryBudgets();
  const [spend, setSpend] = useState<MonthSpend>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [limitInput, setLimitInput] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");

  useEffect(() => {
    const fetchSpend = async () => {
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
      const totals: MonthSpend = {};
      (data || []).forEach((row: any) => {
        totals[row.category] = (totals[row.category] || 0) + Number(row.amount);
      });
      setSpend(totals);
    };
    fetchSpend();
  }, [budgets]);

  const availableCategories = useMemo(
    () => categories.filter((c) => !budgets.some((b) => b.category === c)),
    [categories, budgets]
  );

  const handleAdd = async () => {
    const limit = parseFloat(limitInput);
    if (!selectedCategory) return toast.error("Pick a category");
    if (isNaN(limit) || limit <= 0) return toast.error("Enter a valid limit");
    try {
      await upsertBudget(selectedCategory, limit);
      setSelectedCategory("");
      setLimitInput("");
      toast.success("Budget set");
    } catch (e) {
      toast.error("Failed to save budget");
    }
  };

  const handleSaveEdit = async (category: string) => {
    const limit = parseFloat(editingValue);
    if (isNaN(limit) || limit <= 0) return toast.error("Enter a valid limit");
    try {
      await upsertBudget(category, limit);
      setEditingId(null);
      setEditingValue("");
      toast.success("Budget updated");
    } catch {
      toast.error("Failed to update");
    }
  };

  const colorFor = (ratio: number) => {
    if (ratio >= 1) return "bg-destructive";
    if (ratio >= 0.7) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Target className="w-5 h-5 text-primary" />
          Category Budgets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select category...</option>
            {availableCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Monthly limit (KWD)"
            value={limitInput}
            onChange={(e) => setLimitInput(e.target.value)}
            className="sm:w-48"
          />
          <Button onClick={handleAdd} disabled={loading}>Add</Button>
        </div>

        {/* Existing budgets */}
        {budgets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No budgets set yet. Add one above to start tracking.
          </p>
        ) : (
          <div className="space-y-3">
            {budgets.map((b) => {
              const spent = spend[b.category] || 0;
              const ratio = b.monthlyLimit > 0 ? spent / b.monthlyLimit : 0;
              const pct = Math.min(100, Math.round(ratio * 100));
              return (
                <div key={b.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <div className="font-medium text-sm truncate">{b.category}</div>
                    <div className="flex items-center gap-2 text-xs">
                      {editingId === b.id ? (
                        <>
                          <Input
                            type="number"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="h-7 w-24 text-xs"
                          />
                          <Button size="sm" className="h-7" onClick={() => handleSaveEdit(b.category)}>Save</Button>
                          <Button size="sm" variant="ghost" className="h-7" onClick={() => setEditingId(null)}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <span className="text-muted-foreground">
                            {spent.toFixed(3)} / {b.monthlyLimit.toFixed(3)} KWD
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                            onClick={() => {
                              setEditingId(b.id);
                              setEditingValue(String(b.monthlyLimit));
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteBudget(b.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${colorFor(ratio)} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  {ratio >= 1 && (
                    <p className="text-xs text-destructive mt-1">Over budget</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};