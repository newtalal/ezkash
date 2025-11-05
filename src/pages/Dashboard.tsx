import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { TransactionList } from "@/components/TransactionList";
import { NavigationTabs } from "@/components/NavigationTabs";
import { NetSpendableCard } from "@/components/NetSpendableCard";
import { SpendingPieChart } from "@/components/SpendingPieChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, Wallet } from "lucide-react";
import { Account } from "@/components/AccountsOverview";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Transaction {
  id: string;
  type: "expense";
  amount: number;
  category: string;
  description: string;
  paymentMethod: string;
  date: Date;
}

const Dashboard = () => {
  const { toast: toastHook } = useToast();
  const { t } = useLanguage();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsData) {
        setTransactions(transactionsData.map(t => ({
          id: t.id,
          type: t.type as "expense",
          amount: Number(t.amount),
          category: t.category,
          description: t.description || "",
          paymentMethod: t.payment_method,
          date: new Date(t.date)
        })));
      }

      // Fetch accounts
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id);

      if (accountsData) {
        setAccounts(accountsData.map(a => ({
          id: a.id,
          name: a.name,
          balance: Number(a.balance),
          iconType: a.icon_type,
          color: a.color,
          isSpendable: a.is_spendable
        })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTransactions(transactions.filter(t => t.id !== id));
      toastHook({
        title: "Transaction Deleted",
        description: "The transaction has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toastHook({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };


  // Calculate summary stats
  const totalSpendable = accounts
    .filter(account => account.isSpendable)
    .reduce((sum, account) => sum + account.balance, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalSpendable - totalExpenses;

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
        {/* Summary Cards */}
        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          <Card className="shadow-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Wallet className="w-4 h-4 text-primary" />
                {t("totalSpendable")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {totalSpendable.toFixed(3)} {t("kwd")}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{t("fromActiveAccounts")}</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <TrendingDown className="w-4 h-4 text-destructive" />
                {t("totalSpent")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-destructive">
                {totalExpenses.toFixed(3)} {t("kwd")}
              </div>
            </CardContent>
          </Card>

          <NetSpendableCard totalSpendable={totalSpendable} />
        </div>

        {/* Spending by Category Chart */}
        <SpendingPieChart transactions={transactions} />

        {/* Recent Transactions */}
        <TransactionList
          transactions={transactions.slice(0, 10)}
          onDelete={deleteTransaction}
        />
      </main>
    </div>
  );
};

export default Dashboard;
