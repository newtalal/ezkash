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
import { ArrowDownCircle, ArrowUpCircle, Plus } from "lucide-react";
import { Transaction } from "@/pages/Dashboard";
import { toast } from "sonner";

interface TransactionEntryProps {
  onAddTransaction: (transaction: Omit<Transaction, "id">) => void;
}

const categories = [
  "🍕 Food",
  "🚗 Transport",
  "🏠 Housing",
  "💡 Utilities",
  "🛍️ Shopping",
  "🎬 Entertainment",
  "💰 Salary",
  "💸 Other Income",
  "📱 Subscriptions",
  "💊 Health",
];

const paymentMethods = [
  "Credit Card",
  "Current Account",
  "Savings Account",
  "Cash",
  "Emergency Fund",
];

export const TransactionEntry = ({ onAddTransaction }: TransactionEntryProps) => {
  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !category || !paymentMethod) {
      toast.error("Please fill in all required fields");
      return;
    }

    onAddTransaction({
      type,
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
    
    toast.success("Transaction added successfully!");
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          New Transaction
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === "expense" ? "default" : "outline"}
              className={type === "expense" ? "flex-1 bg-destructive hover:bg-destructive/90 text-sm sm:text-base" : "flex-1 text-sm sm:text-base"}
              onClick={() => setType("expense")}
            >
              <ArrowDownCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Expense
            </Button>
            <Button
              type="button"
              variant={type === "income" ? "default" : "outline"}
              className={type === "income" ? "flex-1 bg-success hover:bg-success/90 text-sm sm:text-base" : "flex-1 text-sm sm:text-base"}
              onClick={() => setType("income")}
            >
              <ArrowUpCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              Income
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm">Amount (KWD)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-xl sm:text-2xl font-semibold h-12 sm:h-14"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment" className="text-sm">Payment Method</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
              <SelectTrigger id="payment">
                <SelectValue placeholder="Select payment method" />
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
            <Label htmlFor="description" className="text-sm">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Add notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <Button type="submit" className="w-full bg-gradient-primary">
            Add Transaction
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
