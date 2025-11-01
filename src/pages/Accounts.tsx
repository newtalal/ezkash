import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { NavigationTabs } from "@/components/NavigationTabs";
import { BudgetSettings } from "@/components/BudgetSettings";
import { AccountsOverview } from "@/components/AccountsOverview";
import { supabase } from "@/integrations/supabase/client";

const Accounts = () => {
  const [monthlyBudget, setMonthlyBudget] = useState(1500);
  const [salaryDate, setSalaryDate] = useState(20);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (settings) {
        setMonthlyBudget(Number(settings.monthly_budget));
        setSalaryDate(Number(settings.salary_date));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = (budget: number, date: number) => {
    setMonthlyBudget(budget);
    setSalaryDate(date);
  };

  if (loading) {
    return (
      <div className="min-h-dvh bg-background w-full max-w-full overflow-x-hidden">
        <DashboardNav />
        <NavigationTabs />
        <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background w-full max-w-full overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <DashboardNav />
      <NavigationTabs />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <BudgetSettings 
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

export default Accounts;
