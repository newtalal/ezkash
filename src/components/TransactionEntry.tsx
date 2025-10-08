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
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm">Amount (KWD)</Label>
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
