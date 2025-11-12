import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { NavigationTabs } from "@/components/NavigationTabs";
import { TransactionEntry } from "@/components/TransactionEntry";
import { TransactionList } from "@/components/TransactionList";
import { EditTransactionDialog } from "@/components/EditTransactionDialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/pages/Dashboard";

const defaultCategories = [
  "🍕 Food",
  "🚗 Transport",
  "🏠 Housing",
  "💡 Utilities",
  "🛍️ Shopping",
  "🎬 Entertainment",
  "📱 Subscriptions",
  "💊 Health",
  "📌 Other",
];

const Expenses = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [categories, setCategories] = useState<string[]>(defaultCategories);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('name')
        .eq('user_id', user.id);

      if (categoriesData && categoriesData.length > 0) {
        setCategories(categoriesData.map(c => c.name));
      }

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
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoriesChange = async (newCategories: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const removedCategories = categories.filter(c => !newCategories.includes(c));
      const addedCategories = newCategories.filter(c => !categories.includes(c));

      // Delete removed categories
      if (removedCategories.length > 0) {
        await supabase
          .from('categories')
          .delete()
          .eq('user_id', user.id)
          .in('name', removedCategories);

        // Update transactions with removed categories to "📌 Other"
        const transactionsToUpdate = transactions.filter(t => 
          removedCategories.includes(t.category)
        );

        for (const t of transactionsToUpdate) {
          await supabase
            .from('transactions')
            .update({ category: "📌 Other" })
            .eq('id', t.id);
        }

        setTransactions(transactions.map(t => 
          removedCategories.includes(t.category) 
            ? { ...t, category: "📌 Other" }
            : t
        ));
      }

      // Add new categories
      if (addedCategories.length > 0) {
        await supabase
          .from('categories')
          .insert(addedCategories.map(name => ({
            user_id: user.id,
            name
          })));
      }

      setCategories(newCategories);
    } catch (error) {
      console.error('Error updating categories:', error);
      toast({
        title: "Error",
        description: "Failed to update categories",
        variant: "destructive",
      });
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, "id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          payment_method: transaction.paymentMethod,
          date: transaction.date.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newTransaction: Transaction = {
          id: data.id,
          type: data.type as "expense",
          amount: Number(data.amount),
          category: data.category,
          description: data.description || "",
          paymentMethod: data.payment_method,
          date: new Date(data.date)
        };
        setTransactions([newTransaction, ...transactions]);
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to add transaction",
        variant: "destructive",
      });
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
      toast({
        title: t("transactionDeleted"),
        description: t("transactionRemoved"),
      });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast({
        title: "Error",
        description: "Failed to delete transaction",
        variant: "destructive",
      });
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditDialog(true);
  };

  const handleTransactionUpdated = () => {
    fetchData();
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
        <TransactionEntry 
          onAddTransaction={addTransaction}
          categories={categories}
          onCategoriesChange={handleCategoriesChange}
        />
        <TransactionList 
          transactions={transactions}
          onDelete={deleteTransaction}
          onEdit={handleEditTransaction}
        />

        {/* Edit Transaction Dialog */}
        <EditTransactionDialog
          transaction={editingTransaction}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onTransactionUpdated={handleTransactionUpdated}
          categories={categories}
        />
      </main>
    </div>
  );
};

export default Expenses;
