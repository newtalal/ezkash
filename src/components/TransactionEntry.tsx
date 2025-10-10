import { useState } from "react";
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
import { Plus, Sparkles } from "lucide-react";
import { Transaction } from "@/pages/Dashboard";
import { toast } from "sonner";
import { CategoryManager } from "@/components/CategoryManager";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

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
  const [transactionText, setTransactionText] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [showPasteInput, setShowPasteInput] = useState(false);

  const paymentMethods = [
    t("creditCard"),
    t("currentAccount"),
    t("savingsAccount"),
    t("cash"),
    t("emergencyFund"),
  ];

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !paymentMethod) {
      toast.error(t("pleaseFillRequired"));
      return;
    }

    onAddTransaction({
      type: "expense",
      amount: parseFloat(amount),
      category,
      description,
      paymentMethod,
      date: new Date(),
    });

    // Reset form
    setAmount("");
    setCategory("");
    setDescription("");
    setPaymentMethod("");
    
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
        {!showPasteInput && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPasteInput(true)}
            className="w-full mb-4 border-dashed"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {t("pasteTransaction")}
          </Button>
        )}

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
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
      </CardContent>
    </Card>
  );
};
