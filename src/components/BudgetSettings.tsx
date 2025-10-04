import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BudgetSettingsProps {
  monthlyIncome: number;
  salaryDate: number;
  onSave: (income: number, date: number) => void;
}

export const BudgetSettings = ({ monthlyIncome, salaryDate, onSave }: BudgetSettingsProps) => {
  const [income, setIncome] = useState(monthlyIncome);
  const [date, setDate] = useState(salaryDate);
  const { toast } = useToast();

  const handleSave = () => {
    if (income <= 0) {
      toast({
        title: "Invalid Income",
        description: "Please enter a valid monthly income",
        variant: "destructive",
      });
      return;
    }

    if (date < 1 || date > 31) {
      toast({
        title: "Invalid Date",
        description: "Salary date must be between 1 and 31",
        variant: "destructive",
      });
      return;
    }

    onSave(income, date);
    toast({
      title: "Budget Settings Saved",
      description: "Your monthly budget has been updated",
    });
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          Budget Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="monthly-income">Monthly Income (KWD)</Label>
          <Input
            id="monthly-income"
            type="number"
            value={income}
            onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
            placeholder="Enter your monthly income"
            className="text-lg"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="salary-date">Salary Deposit Date (1-31)</Label>
          <Input
            id="salary-date"
            type="number"
            min="1"
            max="31"
            value={date}
            onChange={(e) => setDate(parseInt(e.target.value) || 20)}
            placeholder="Day of the month"
          />
          <p className="text-xs text-muted-foreground">
            Your spending cycle runs from the {date}th to the {date - 1}th of each month
          </p>
        </div>

        <Button onClick={handleSave} className="w-full">
          Save Budget Settings
        </Button>
      </CardContent>
    </Card>
  );
};