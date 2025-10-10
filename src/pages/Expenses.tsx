import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { NavigationTabs } from "@/components/NavigationTabs";
import { TransactionEntry } from "@/components/TransactionEntry";
import { TransactionList } from "@/components/TransactionList";
import { useToast } from "@/hooks/use-toast";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: Date;
}

const Expenses = () => {
  const { toast } = useToast();
  const [salaryDate] = useState(() => {
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

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast({
      title: "Transaction Deleted",
      description: "The transaction has been removed successfully",
    });
  };

  return (
    <div className="min-h-dvh bg-background w-full max-w-full overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <DashboardNav />
      <NavigationTabs />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <TransactionEntry onAddTransaction={addTransaction} />
        <TransactionList 
          transactions={transactions}
          salaryDate={salaryDate}
          onDelete={deleteTransaction}
        />
      </main>
    </div>
  );
};

export default Expenses;
