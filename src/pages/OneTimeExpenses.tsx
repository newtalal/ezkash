import { useState, useEffect } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { NavigationTabs } from "@/components/NavigationTabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Pencil, Trash2, RotateCcw, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface OneTimeExpense {
  id: string;
  description: string;
  amount: number;
  is_paid: boolean;
  created_at: string;
}

const OneTimeExpenses = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState<OneTimeExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingExpense, setEditingExpense] = useState<OneTimeExpense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<OneTimeExpense | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("one_time_expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_paid", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!description.trim() || !amount || parseFloat(amount) <= 0) {
      toast({
        title: t("invalidInput"),
        description: t("pleaseFillRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("one_time_expenses").insert({
        user_id: user.id,
        description: description.trim(),
        amount: parseFloat(amount),
      });

      if (error) throw error;

      toast({
        title: t("expenseAdded"),
        description: t("expenseAddedSuccess"),
      });

      setDescription("");
      setAmount("");
      fetchExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingExpense || !editingExpense.description.trim() || editingExpense.amount <= 0) {
      toast({
        title: t("invalidInput"),
        description: t("pleaseFillRequired"),
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from("one_time_expenses")
        .update({
          description: editingExpense.description.trim(),
          amount: editingExpense.amount,
        })
        .eq("id", editingExpense.id);

      if (error) throw error;

      toast({
        title: t("expenseUpdated"),
        description: t("expenseUpdatedSuccess"),
      });

      setEditingExpense(null);
      fetchExpenses();
    } catch (error) {
      console.error("Error updating expense:", error);
      toast({
        title: "Error",
        description: "Failed to update expense",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deletingExpense) return;

    try {
      const { error } = await supabase
        .from("one_time_expenses")
        .delete()
        .eq("id", deletingExpense.id);

      if (error) throw error;

      toast({
        title: t("expenseDeleted"),
        description: t("expenseDeletedSuccess"),
      });

      setDeletingExpense(null);
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive",
      });
    }
  };

  const togglePaid = async (expense: OneTimeExpense) => {
    try {
      const { error } = await supabase
        .from("one_time_expenses")
        .update({ is_paid: !expense.is_paid })
        .eq("id", expense.id);

      if (error) throw error;
      fetchExpenses();
    } catch (error) {
      console.error("Error toggling paid status:", error);
    }
  };

  const handleResetAll = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("one_time_expenses")
        .update({ is_paid: false })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: t("allExpensesReset"),
        description: t("allExpensesMarkedUnpaid"),
      });

      setShowResetDialog(false);
      fetchExpenses();
    } catch (error) {
      console.error("Error resetting expenses:", error);
      toast({
        title: "Error",
        description: "Failed to reset expenses",
        variant: "destructive",
      });
    }
  };

  const filteredExpenses = expenses.filter((expense) =>
    expense.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  const unpaidAmount = expenses.filter(e => !e.is_paid).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-dvh bg-background w-full max-w-full overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <DashboardNav />
      <NavigationTabs />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <Card className="shadow-card">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle>{t("addOneTimeExpense")}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("description")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">{t("amount")} ({t("kwd")})</Label>
              <Input
                id="amount"
                type="number"
                step="0.001"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.000"
              />
            </div>
            <Button onClick={handleAdd} className="w-full">
              {t("save")}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle>{t("oneTimeExpenses")}</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetDialog(true)}
                disabled={expenses.length === 0}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                {t("resetAllToNotPaid")}
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchExpenses")}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">{t("loading")}...</p>
            ) : filteredExpenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{t("noExpensesYet")}</p>
                <p className="text-sm text-muted-foreground mt-1">{t("startAddingExpenses")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("description")}</TableHead>
                      <TableHead className="text-right">{t("amount")}</TableHead>
                      <TableHead className="text-center">{t("paid")}</TableHead>
                      <TableHead className="text-right">{t("edit")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell className="text-right">{expense.amount.toFixed(3)}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={expense.is_paid}
                              onCheckedChange={() => togglePaid(expense)}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingExpense(expense)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingExpense(expense)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
          <CardFooter className="p-4 sm:p-6 pt-0 flex flex-col gap-2 border-t">
            <div className="flex justify-between w-full">
              <span className="font-medium">{t("totalOneTimeCommitments")}:</span>
              <span className="font-bold">{totalAmount.toFixed(3)} {t("kwd")}</span>
            </div>
            <div className="flex justify-between w-full">
              <span className="font-medium">{t("remainingNotPaid")}:</span>
              <span className={`font-bold ${unpaidAmount > 0 ? "text-destructive" : ""}`}>
                {unpaidAmount.toFixed(3)} {t("kwd")}
              </span>
            </div>
          </CardFooter>
        </Card>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editingExpense} onOpenChange={(open) => !open && setEditingExpense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("editExpense")}</DialogTitle>
          </DialogHeader>
          {editingExpense && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-description">{t("description")}</Label>
                <Input
                  id="edit-description"
                  value={editingExpense.description}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">{t("amount")} ({t("kwd")})</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  step="0.001"
                  min="0"
                  value={editingExpense.amount}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, amount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingExpense(null)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleUpdate}>{t("save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deletingExpense} onOpenChange={(open) => !open && setDeletingExpense(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>{t("confirmDeleteDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>{t("delete")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("resetConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("resetConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetAll}>{t("resetAllToNotPaid")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OneTimeExpenses;
