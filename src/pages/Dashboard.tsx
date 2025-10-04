import { useState, useEffect } from "react";
import { TransactionEntry } from "@/components/TransactionEntry";
import { TransactionList } from "@/components/TransactionList";
import { AccountsOverview } from "@/components/AccountsOverview";
import { DashboardNav } from "@/components/DashboardNav";
import { SpendingPower } from "@/components/SpendingPower";
import { BudgetSettings } from "@/components/BudgetSettings";

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

  const [transactions, setTransactions] = useState<Transaction[]>([
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
  ]);

  useEffect(() => {
    localStorage.setItem("monthlyIncome", monthlyIncome.toString());
    localStorage.setItem("salaryDate", salaryDate.toString());
  }, [monthlyIncome, salaryDate]);

  const handleSaveBudget = (income: number, date: number) => {
    setMonthlyIncome(income);
    setSalaryDate(date);
  };

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  return (
    <div className="min-h-screen bg-background w-full">
      <DashboardNav />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="md:col-span-2 xl:col-span-2 space-y-4 sm:space-y-6">
            <BudgetSettings 
              monthlyIncome={monthlyIncome}
              salaryDate={salaryDate}
              onSave={handleSaveBudget}
            />
            <TransactionEntry onAddTransaction={addTransaction} />
            <SpendingPower 
              transactions={transactions} 
              monthlyIncome={monthlyIncome}
              salaryDate={salaryDate}
            />
            <TransactionList 
              transactions={transactions}
              salaryDate={salaryDate}
            />
          </div>
          <div>
            <AccountsOverview />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
