import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { NavigationTabs } from "@/components/NavigationTabs";
import { BudgetSettings } from "@/components/BudgetSettings";
import { AccountsOverview } from "@/components/AccountsOverview";

const Settings = () => {
  const [monthlyIncome, setMonthlyIncome] = useState(() => {
    const saved = localStorage.getItem("monthlyIncome");
    return saved ? parseFloat(saved) : 1500;
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    const saved = localStorage.getItem("monthlyBudget");
    return saved ? parseFloat(saved) : 1500;
  });

  const [salaryDate, setSalaryDate] = useState(() => {
    const saved = localStorage.getItem("salaryDate");
    return saved ? parseInt(saved) : 20;
  });

  useEffect(() => {
    localStorage.setItem("monthlyIncome", monthlyIncome.toString());
    localStorage.setItem("monthlyBudget", monthlyBudget.toString());
    localStorage.setItem("salaryDate", salaryDate.toString());
  }, [monthlyIncome, monthlyBudget, salaryDate]);

  const handleSaveBudget = (income: number, budget: number, date: number) => {
    setMonthlyIncome(income);
    setMonthlyBudget(budget);
    setSalaryDate(date);
  };

  return (
    <div className="min-h-dvh bg-background w-full max-w-full overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <DashboardNav />
      <NavigationTabs />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <BudgetSettings 
            monthlyIncome={monthlyIncome}
            monthlyBudget={monthlyBudget}
            salaryDate={salaryDate}
            onSave={handleSaveBudget}
          />
          <AccountsOverview />
        </div>
      </main>
    </div>
  );
};

export default Settings;
