import { useState } from "react";
import { TransactionEntry } from "@/components/TransactionEntry";
import { TransactionList } from "@/components/TransactionList";
import { AccountsOverview } from "@/components/AccountsOverview";
import { DashboardNav } from "@/components/DashboardNav";
import { SpendingPower } from "@/components/SpendingPower";

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

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav />
      <main className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TransactionEntry onAddTransaction={addTransaction} />
            <SpendingPower transactions={transactions} />
            <TransactionList transactions={transactions} />
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
