import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface MerchantRule {
  id: string;
  merchantKeyword: string;
  category: string;
}

const table = "merchant_category_rules" as const;

export function extractKeyword(description: string): string | null {
  const trimmed = (description || "").trim().toLowerCase();
  if (!trimmed) return null;
  if (trimmed.length <= 20) return trimmed;
  // first significant word (>2 chars)
  const words = trimmed.split(/\s+/).filter((w) => w.length > 2);
  return words[0] || trimmed.split(/\s+/)[0] || null;
}

export function useMerchantRules() {
  const [rules, setRules] = useState<MerchantRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setRules([]);
      setLoading(false);
      return;
    }
    const { data, error } = await (supabase as any)
      .from(table)
      .select("*")
      .eq("user_id", user.id);
    if (!error && data) {
      setRules(
        data.map((r: any) => ({
          id: r.id,
          merchantKeyword: r.merchant_keyword,
          category: r.category,
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const matchRule = useCallback(
    (description: string): MerchantRule | null => {
      const desc = (description || "").toLowerCase().trim();
      if (!desc) return null;
      // Prefer exact keyword match first
      const keyword = extractKeyword(desc);
      if (keyword) {
        const exact = rules.find((r) => r.merchantKeyword === keyword);
        if (exact) return exact;
      }
      // Fallback: any stored keyword contained in description
      return (
        rules.find((r) => desc.includes(r.merchantKeyword)) || null
      );
    },
    [rules]
  );

  const upsertRule = useCallback(
    async (description: string, category: string) => {
      const keyword = extractKeyword(description);
      if (!keyword || !category) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const existing = rules.find((r) => r.merchantKeyword === keyword);
      if (existing) return; // don't overwrite prior learning silently
      const { error } = await (supabase as any)
        .from(table)
        .upsert(
          { user_id: user.id, merchant_keyword: keyword, category },
          { onConflict: "user_id,merchant_keyword" }
        );
      if (!error) fetchRules();
    },
    [rules, fetchRules]
  );

  return { rules, loading, refetch: fetchRules, matchRule, upsertRule };
}