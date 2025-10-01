import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/pages/Dashboard";
import { format, subDays } from "date-fns";
import { TrendingDown, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SpendingPowerProps {
  transactions: Transaction[];
}

export const SpendingPower = ({ transactions }: SpendingPowerProps) => {
  const dailyCap = 50; // KWD per day

  const todayExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        format(t.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const last7DaysExpenses = transactions
    .filter((t) => {
      const daysDiff = Math.floor(
        (new Date().getTime() - t.date.getTime()) / (1000 * 60 * 60 * 24)
      );
      return t.type === "expense" && daysDiff < 7;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const averageDailySpend = last7DaysExpenses / 7;
  const remaining = dailyCap - todayExpenses;
  const progressPercent = Math.min((todayExpenses / dailyCap) * 100, 100);
  const isOverBudget = todayExpenses > dailyCap;

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-primary" />
          Spending Power
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Daily Budget</span>
            <span className="font-semibold">{dailyCap.toFixed(3)} KWD</span>
          </div>
          <Progress
            value={progressPercent}
            className={`h-3 ${isOverBudget ? "[&>div]:bg-destructive" : "[&>div]:bg-success"}`}
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Spent today</span>
            <span
              className={`text-lg font-bold ${
                isOverBudget ? "text-destructive" : "text-foreground"
              }`}
            >
              {todayExpenses.toFixed(3)} KWD
            </span>
          </div>
        </div>

        {isOverBudget ? (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive text-sm">
                Over budget today
              </p>
              <p className="text-xs text-destructive/80">
                You've exceeded your daily limit by{" "}
                {Math.abs(remaining).toFixed(3)} KWD
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-sm text-muted-foreground mb-1">Remaining today</p>
            <p className="text-2xl font-bold text-success">
              {remaining.toFixed(3)} KWD
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              7-day average
            </span>
            <span className="font-semibold">
              {averageDailySpend.toFixed(3)} KWD/day
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
