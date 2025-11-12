import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Transaction } from "@/pages/Dashboard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionUpdated: () => void;
  categories: string[];
}

export const EditTransactionDialog = ({
  transaction,
  open,
  onOpenChange,
  onTransactionUpdated,
  categories,
}: EditTransactionDialogProps) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string; balance: number }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setCategory(transaction.category);
      setDescription(transaction.description || "");
      setPaymentMethod(transaction.paymentMethod);
      setDate(transaction.date);
    }
  }, [transaction]);

  useEffect(() => {
    if (open) {
      fetchAccounts();
    }
  }, [open]);

  const fetchAccounts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('accounts')
        .select('id, name, balance')
        .eq('user_id', user.id);

      if (error) throw error;
      if (data) {
        setAccounts(data.map(a => ({
          id: a.id,
          name: a.name,
          balance: Number(a.balance)
        })));
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    const newAmount = parseFloat(amount);

    // Validation
    if (!amount || isNaN(newAmount) || newAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!category || !paymentMethod) {
      toast.error(t("pleaseFillRequired"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if payment method changed or amount changed
      const oldAmount = transaction.amount;
      const oldPaymentMethod = transaction.paymentMethod;
      const amountChanged = oldAmount !== newAmount;
      const paymentChanged = oldPaymentMethod !== paymentMethod;

      // Find old and new accounts
      const oldAccount = accounts.find(acc => 
        acc.name.toLowerCase() === oldPaymentMethod.toLowerCase()
      );
      const newAccount = accounts.find(acc => 
        acc.name.toLowerCase() === paymentMethod.toLowerCase()
      );

      // Handle account balance adjustments
      if (paymentChanged || amountChanged) {
        // Refund old account if it exists
        if (oldAccount) {
          const { error } = await supabase
            .from('accounts')
            .update({ balance: oldAccount.balance + oldAmount })
            .eq('id', oldAccount.id);

          if (error) throw error;
        }

        // Deduct from new account if it exists
        if (newAccount) {
          if (newAccount.balance + (oldAccount?.id === newAccount.id ? oldAmount : 0) < newAmount) {
            toast.error("Insufficient funds in selected account.");
            setIsSubmitting(false);
            return;
          }

          const { error } = await supabase
            .from('accounts')
            .update({ balance: newAccount.balance - newAmount + (oldAccount?.id === newAccount.id ? oldAmount : 0) })
            .eq('id', newAccount.id);

          if (error) throw error;
        }
      }

      // Update transaction
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: newAmount,
          category,
          description,
          payment_method: paymentMethod,
          date: date.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', transaction.id);

      if (error) throw error;

      toast.success(t("transactionUpdated") || "Transaction updated successfully");
      onTransactionUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error("Failed to update transaction");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("editTransaction") || "Edit Transaction"}</DialogTitle>
          <DialogDescription>
            {t("updateTransactionDetails") || "Update the transaction details below."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-amount">{t("amount")} ({t("kwd")})</Label>
            <Input
              id="edit-amount"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
                  setAmount(value);
                }
              }}
              className="text-xl font-semibold"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">{t("category")}</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="edit-category">
                <SelectValue placeholder={t("selectCategory")} />
              </SelectTrigger>
              <SelectContent className="bg-popover max-h-[300px]">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-payment">{t("paymentMethod")}</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger id="edit-payment">
                <SelectValue placeholder={t("selectPaymentMethod")} />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {accounts.length > 0 ? (
                  accounts.map((account) => (
                    <SelectItem key={account.id} value={account.name}>
                      {account.name} ({account.balance.toFixed(3)} {t("kwd")})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-accounts" disabled>
                    No accounts available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-date">{t("date")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="edit-date"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd-MM-yyyy") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">{t("descriptionOptional")}</Label>
            <Textarea
              id="edit-description"
              placeholder={t("addNotes")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t("cancel")}
            </Button>
            <Button type="submit" className="bg-gradient-primary" disabled={isSubmitting}>
              {isSubmitting ? t("saving") || "Saving..." : t("saveChanges") || "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
