import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, TrendingUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NetSpendableCardProps {
  totalSpendable: number;
}

export const NetSpendableCard = ({ totalSpendable }: NetSpendableCardProps) => {
  const { t } = useLanguage();
  const [remainingFixed, setRemainingFixed] = useState(0);
  const [remainingOneTime, setRemainingOneTime] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCommitments();
  }, []);

  const fetchCommitments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: fixedData } = await supabase
        .from("fixed_expenses")
        .select("amount")
        .eq("user_id", user.id)
        .eq("is_paid", false);

      const { data: oneTimeData } = await supabase
        .from("one_time_expenses")
        .select("amount")
        .eq("user_id", user.id)
        .eq("is_paid", false);

      const fixed = fixedData?.reduce((sum, e) => sum + e.amount, 0) || 0;
      const oneTime = oneTimeData?.reduce((sum, e) => sum + e.amount, 0) || 0;

      setRemainingFixed(fixed);
      setRemainingOneTime(oneTime);
    } catch (error) {
      console.error("Error fetching commitments:", error);
    } finally {
      setLoading(false);
    }
  };

  const netSpendable = totalSpendable - (remainingFixed + remainingOneTime);
  const isNegative = netSpendable < 0;

  return (
    <Card className={`shadow-card ${isNegative ? "border-destructive" : ""}`}>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {isNegative ? (
            <AlertCircle className="w-4 h-4 text-destructive" />
          ) : (
            <TrendingUp className="w-4 h-4 text-primary" />
          )}
          {t("netSpendableAfterCommitments")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {loading ? (
          <div className="text-lg text-muted-foreground">Loading...</div>
        ) : (
          <>
            <div className={`text-2xl sm:text-3xl font-bold ${isNegative ? "text-destructive" : "text-primary"}`}>
              {netSpendable.toFixed(3)} {t("kwd")}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-muted-foreground mt-2 cursor-help">
                    {t("spendableMinusCommitments")}
                  </p>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                      <span>{t("totalSpendable")}:</span>
                      <span className="font-medium">{totalSpendable.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>{t("remainingNotPaid")} ({t("fixedExpenses")}):</span>
                      <span className="font-medium">-{remainingFixed.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>{t("remainingNotPaid")} ({t("oneTimeExpenses")}):</span>
                      <span className="font-medium">-{remainingOneTime.toFixed(3)}</span>
                    </div>
                    <div className="border-t pt-1 mt-1 flex justify-between gap-4 font-bold">
                      <span>{t("netSpendableAfterCommitments")}:</span>
                      <span>{netSpendable.toFixed(3)}</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </>
        )}
      </CardContent>
    </Card>
  );
};
