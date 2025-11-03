import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Sparkles, Clipboard, CalendarIcon } from "lucide-react";
import { Transaction } from "@/pages/Dashboard";
import { toast } from "sonner";
import { CategoryManager } from "@/components/CategoryManager";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TransactionEntryProps {
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
  categories: string[];
  onCategoriesChange: (categories: string[]) => void;
}

export const TransactionEntry = ({ onAddTransaction, categories, onCategoriesChange }: TransactionEntryProps) => {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [transactionText, setTransactionText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [showPasteInput, setShowPasteInput] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [parsedData, setParsedData] = useState<{
    amount: string;
    description: string;
    category: string;
  } | null>(null);
  const [accounts, setAccounts] = useState<Array<{ id: string; name: string; balance: number }>>([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

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


  const handlePasteFromClipboard = async () => {
    setIsParsing(true);
    try {
      const clipboardText = await navigator.clipboard.readText();
      
      if (!clipboardText.trim()) {
        toast.error("Clipboard is empty. Please copy bank SMS first.");
        setIsParsing(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('parse-transaction', {
        body: { transactionText: clipboardText }
      });

      if (error) {
        console.error("Error parsing transaction:", error);
        toast.error("Failed to parse transaction");
        setIsParsing(false);
        return;
      }

      if (data) {
        setParsedData({
          amount: data.amount.toString(),
          description: data.description,
          category: data.category
        });
        setShowApprovalDialog(true);
        toast.success("Transaction extracted successfully!");
      }
    } catch (error: any) {
      console.error("Error:", error);
      if (error.name === 'NotAllowedError' || error.message?.includes('permission')) {
        toast.error("Clipboard not accessible. Please paste manually below.");
        setShowPasteInput(true);
      } else {
        toast.error("Failed to read clipboard. Please paste manually.");
        setShowPasteInput(true);
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleParseTransaction = async () => {
    if (!transactionText.trim()) {
      toast.error(t("pleasePasteText"));
      return;
    }

    setIsParsing(true);
    try {
      const { data, error } = await supabase.functions.invoke('parse-transaction', {
        body: { transactionText }
      });

      if (error) {
        console.error("Error parsing transaction:", error);
        toast.error(t("failedToParse"));
        return;
      }

      if (data) {
        setAmount(data.amount.toString());
        setDescription(data.description);
        setCategory(data.category);
        setTransactionText("");
        setShowPasteInput(false);
        toast.success(t("transactionParsed"));
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(t("failedToParse"));
    } finally {
      setIsParsing(false);
    }
  };

  const handleApproveTransaction = () => {
    if (parsedData) {
      setAmount(parsedData.amount);
      setDescription(parsedData.description);
      setCategory(parsedData.category);
      setShowApprovalDialog(false);
      setParsedData(null);
      toast.success("Transaction details applied!");
    }
  };

  const handleCancelApproval = () => {
    setShowApprovalDialog(false);
    setParsedData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const expenseAmount = parseFloat(amount);
    
    // Validation
    if (!amount || isNaN(expenseAmount) || expenseAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    if (!category || !paymentMethod) {
      toast.error(t("pleaseFillRequired"));
      return;
    }

    // Check account balance if payment method matches an account
    const matchingAccount = accounts.find(acc => 
      acc.name.toLowerCase() === paymentMethod.toLowerCase()
    );

    if (matchingAccount) {
      if (matchingAccount.balance < expenseAmount) {
        toast.error("Insufficient funds in selected account.");
        return;
      }

      // Deduct from account balance
      try {
        const { error } = await supabase
          .from('accounts')
          .update({ balance: matchingAccount.balance - expenseAmount })
          .eq('id', matchingAccount.id);

        if (error) throw error;
        
        // Refresh accounts after update
        await fetchAccounts();
      } catch (error) {
        console.error('Error updating account balance:', error);
        toast.error("Failed to update account balance");
        return;
      }
    }

    onAddTransaction({
      type: "expense",
      amount: expenseAmount,
      category,
      description,
      paymentMethod,
      date: date,
    });

    // Reset form
    setAmount("");
    setCategory("");
    setDescription("");
    setPaymentMethod("");
    setDate(new Date());
    
    toast.success(t("transactionAdded"));
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          {t("newTransaction")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant="default"
            onClick={handlePasteFromClipboard}
            disabled={isParsing}
            className="flex-1 bg-gradient-primary"
          >
            <Clipboard className="w-4 h-4 mr-2" />
            {isParsing ? "Analyzing..." : "Paste Bank SMS"}
          </Button>
          {!showPasteInput && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasteInput(true)}
              className="border-dashed"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          )}
        </div>

        {showPasteInput && (
          <div className="space-y-3 mb-4 p-3 border border-primary/20 rounded-lg bg-primary/5">
            <div className="space-y-2">
              <Label htmlFor="transaction-text" className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {t("pasteTransactionText")}
              </Label>
              <Textarea
                id="transaction-text"
                placeholder={t("pasteYourBank")}
                value={transactionText}
                onChange={(e) => setTransactionText(e.target.value)}
                rows={3}
                className="font-mono text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleParseTransaction}
                disabled={isParsing || !transactionText.trim()}
                className="flex-1"
              >
                {isParsing ? t("parsing") : t("parseWithAI")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasteInput(false);
                  setTransactionText("");
                }}
              >
                {t("cancel")}
              </Button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm">{t("amount")} ({t("kwd")})</Label>
            <Input
              id="amount"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                // Only allow numbers and one decimal point
                if (value === '' || /^\d*\.?\d{0,3}$/.test(value)) {
                  setAmount(value);
                }
              }}
              className="text-xl sm:text-2xl font-semibold h-12 sm:h-14"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category" className="text-sm">{t("category")}</Label>
              <CategoryManager 
                categories={categories}
                onCategoriesChange={onCategoriesChange}
              />
            </div>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
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
            <Label htmlFor="payment" className="text-sm">{t("paymentMethod")}</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger id="payment">
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
                  <SelectItem value="" disabled>
                    No accounts available. Please create an account first.
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-sm">{t("date")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
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
            <Label htmlFor="description" className="text-sm">{t("descriptionOptional")}</Label>
            <Textarea
              id="description"
              placeholder={t("addNotes")}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-primary">
            {t("addTransaction")}
          </Button>
        </form>

        <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Review Transaction Details</DialogTitle>
              <DialogDescription>
                Review and modify the parsed transaction details before adding it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="dialog-amount">Amount (KWD)</Label>
                <Input
                  id="dialog-amount"
                  type="text"
                  inputMode="decimal"
                  value={parsedData?.amount || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (parsedData && (value === '' || /^\d*\.?\d{0,3}$/.test(value))) {
                      setParsedData({ ...parsedData, amount: value });
                    }
                  }}
                  className="text-xl font-semibold"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dialog-category">Category</Label>
                <Select 
                  value={parsedData?.category || ""} 
                  onValueChange={(value) => parsedData && setParsedData({ ...parsedData, category: value })}
                >
                  <SelectTrigger id="dialog-category">
                    <SelectValue placeholder="Select category" />
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
                <Label htmlFor="dialog-description">Description</Label>
                <Textarea
                  id="dialog-description"
                  value={parsedData?.description || ""}
                  onChange={(e) => parsedData && setParsedData({ ...parsedData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancelApproval}>
                Cancel
              </Button>
              <Button type="button" onClick={handleApproveTransaction} className="bg-gradient-success">
                Approve & Add
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
