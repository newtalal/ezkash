import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { SpendingPower } from "@/components/SpendingPower";
import { TransactionList } from "@/components/TransactionList";
import { NavigationTabs } from "@/components/NavigationTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Wallet } from "lucide-react";
import { Account } from "@/components/AccountsOverview";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: Date;
}

const Dashboard = () => {
  const [monthlyIncome, setMonthlyIncome] = useState(() => {
    const saved = localStorage.getItem("monthlyIncome");
    return saved ? parseFloat(saved) : 1500;
  });

  const [salaryDate, setSalaryDate] = useState(() => {
    const saved = localStorage.getItem("salaryDate");
    return saved ? parseInt(saved) : 20;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("transactions");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
    }
    return [
      {
        id: "1",
        type: "expense",
        amount: 25.50,
        category: "🍕 Food",
        description: "Lunch at restaurant",
        paymentMethod: "Credit Card",
        date: new Date(),
      },
      {
        id: "2",
        type: "income",
        amount: 1000,
        category: "💰 Salary",
        description: "Monthly salary",
        paymentMethod: "Current Account",
        date: new Date(),
      },
    ];
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem("accounts");
    if (saved) {
      return JSON.parse(saved);
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem("monthlyIncome", monthlyIncome.toString());
    localStorage.setItem("salaryDate", salaryDate.toString());
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [monthlyIncome, salaryDate, transactions]);

  // Calculate summary stats
  const totalSpendable = accounts
    .filter(account => account.isSpendable)
    .reduce((sum, account) => sum + account.balance, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalSpendable - totalExpenses;

  return (
    <div className="min-h-dvh bg-background w-full max-w-full overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <DashboardNav />
      <NavigationTabs />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Summary Cards */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Wallet className="w-4 h-4 text-primary" />
                Total Spendable
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {totalSpendable.toFixed(3)} KWD
              </div>
              <p className="text-xs text-muted-foreground mt-1">From active accounts</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingDown className="w-4 h-4 text-destructive" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-destructive">
                {totalExpenses.toFixed(3)} KWD
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Spending Power */}
        <SpendingPower 
          transactions={transactions} 
          monthlyIncome={monthlyIncome}
          salaryDate={salaryDate}
        />

        {/* Recent Transactions */}
        <TransactionList 
          transactions={transactions.slice(0, 10)}
          salaryDate={salaryDate}
        />
      </main>
    </div>
  );
};

export default Dashboard;
