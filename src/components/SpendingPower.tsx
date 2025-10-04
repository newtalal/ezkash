import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/pages/Dashboard";
import { format } from "date-fns";
import { TrendingDown, AlertCircle, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getCurrentCycle, getDaysRemainingInCycle, getDaysElapsedInCycle } from "@/lib/cycleUtils";

interface SpendingPowerProps {
  transactions: Transaction[];
  monthlyIncome: number;
  salaryDate: number;
}

export const SpendingPower = ({ transactions, monthlyIncome, salaryDate }: SpendingPowerProps) => {
  const { startDate, endDate } = getCurrentCycle(salaryDate);
  const daysRemaining = getDaysRemainingInCycle(salaryDate);
  const daysElapsed = getDaysElapsedInCycle(salaryDate);
  const totalDaysInCycle = daysElapsed + daysRemaining;

  // Filter transactions for current cycle
  const cycleTransactions = transactions.filter(
    (t) => t.date >= startDate && t.date <= endDate
  );

  const cycleExpenses = cycleTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const todayExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        format(t.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = monthlyIncome - cycleExpenses;
  const dailyBudget = remaining / Math.max(daysRemaining, 1);
  const progressPercent = Math.min((cycleExpenses / monthlyIncome) * 100, 100);
  const isOverBudget = cycleExpenses > monthlyIncome;

  return (
    <Card className="shadow-card">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
          <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          Spending Power
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs sm:text-sm text-muted-foreground">Monthly Budget</span>
            <span className="text-sm sm:text-base font-semibold">{monthlyIncome.toFixed(3)} KWD</span>
          </div>
          <Progress
            value={progressPercent}
            className={`h-3 ${isOverBudget ? "[&>div]:bg-destructive" : "[&>div]:bg-success"}`}
          />
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-muted-foreground">Spent this cycle</span>
            <span
              className={`text-base sm:text-lg font-bold ${
                isOverBudget ? "text-destructive" : "text-foreground"
              }`}
            >
              {cycleExpenses.toFixed(3)} KWD
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 sm:p-3 rounded-lg bg-muted/50 border border-border">
          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Current Cycle</p>
            <p className="text-xs sm:text-sm font-medium truncate">
              {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Days left</p>
            <p className="text-base sm:text-lg font-bold text-primary">{daysRemaining}</p>
          </div>
        </div>

        {isOverBudget ? (
          <div className="flex items-start gap-2 p-2.5 sm:p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive text-xs sm:text-sm">
                Over budget this cycle
              </p>
              <p className="text-[10px] sm:text-xs text-destructive/80">
                You've exceeded your monthly budget by{" "}
                {Math.abs(remaining).toFixed(3)} KWD
              </p>
            </div>
          </div>
        ) : (
          <div className="p-3 sm:p-4 rounded-lg bg-success/10 border border-success/20">
            <p className="text-xs sm:text-sm text-muted-foreground mb-1">Remaining this cycle</p>
            <p className="text-xl sm:text-2xl font-bold text-success">
              {remaining.toFixed(3)} KWD
            </p>
          </div>
        )}

        <div className="pt-2.5 sm:pt-3 border-t border-border space-y-1.5 sm:space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Recommended daily spend
            </span>
            <span className="text-sm sm:text-base font-semibold">
              {dailyBudget.toFixed(3)} KWD/day
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Spent today
            </span>
            <span className={`text-sm sm:text-base font-semibold ${todayExpenses > dailyBudget ? "text-destructive" : "text-success"}`}>
              {todayExpenses.toFixed(3)} KWD
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
