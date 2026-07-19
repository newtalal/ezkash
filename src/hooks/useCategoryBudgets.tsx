import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CategoryBudget {
  id: string;
  category: string;
  monthlyLimit: number;
}

const table = "category_budgets" as const;

export function useCategoryBudgets() {
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBudgets = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setBudgets([]);
      setLoading(false);
      return;
    }
    const { data, error } = await (supabase as any)
      .from(table)
      .select("*")
      .eq("user_id", user.id)
      .order("category", { ascending: true });
    if (!error && data) {
      setBudgets(
        data.map((b: any) => ({
          id: b.id,
          category: b.category,
          monthlyLimit: Number(b.monthly_limit),
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const upsertBudget = useCallback(async (category: string, monthlyLimit: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await (supabase as any)
      .from(table)
      .upsert(
        { user_id: user.id, category, monthly_limit: monthlyLimit },
        { onConflict: "user_id,category" }
      )
      .select()
      .single();
    if (error) throw error;
    await fetchBudgets();
    return data;
  }, [fetchBudgets]);

  const deleteBudget = useCallback(async (id: string) => {
    const { error } = await (supabase as any).from(table).delete().eq("id", id);
    if (error) throw error;
    await fetchBudgets();
  }, [fetchBudgets]);

  return { budgets, loading, refetch: fetchBudgets, upsertBudget, deleteBudget };
}