import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface BudgetSettingsProps {
  monthlyBudget: number;
  salaryDate: number;
  onSave: (budget: number, date: number) => void;
}

export const BudgetSettings = ({ monthlyBudget, salaryDate, onSave }: BudgetSettingsProps) => {
  const [budget, setBudget] = useState(monthlyBudget);
  const [date, setDate] = useState(salaryDate);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleSave = () => {
    if (budget <= 0) {
      toast({
        title: t("invalidBudget"),
        description: t("pleaseEnterValidBudget"),
        variant: "destructive",
      });
      return;
    }

    if (date < 1 || date > 31) {
      toast({
        title: t("invalidDate"),
        description: t("salaryDateBetween"),
        variant: "destructive",
      });
      return;
    }

    onSave(budget, date);
    toast({
      title: t("budgetSettingsSaved"),
      description: t("monthlyBudgetUpdated"),
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          {t("budgetSettings")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <div className="space-y-2">
          <Label htmlFor="monthly-budget" className="text-sm">{t("monthlyBudget")} ({t("kwd")})</Label>
          <Input
            id="monthly-budget"
            type="text"
            inputMode="decimal"
            value={budget}
            onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
            placeholder={t("monthlyBudget")}
            className="text-base sm:text-lg"
          />
          <p className="text-xs text-muted-foreground">
            {t("setSpendingLimit")}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary-date" className="text-sm">{t("salaryDepositDate")}</Label>
          <Input
            id="salary-date"
            type="text"
            inputMode="numeric"
            min="1"
            max="31"
            value={date}
            onChange={(e) => setDate(parseInt(e.target.value) || 20)}
            placeholder="Day of the month"
          />
          <p className="text-xs text-muted-foreground">
            {t("spendingCycleRuns")} {date}{t("th")} {t("toThe")} {date - 1}{t("th")} {t("ofEachMonth")}
          </p>
        </div>

        <Button onClick={handleSave} className="w-full">
          {t("saveBudgetSettings")}
        </Button>
      </CardContent>
    </Card>
  );
};