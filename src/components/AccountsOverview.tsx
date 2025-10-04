import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, PiggyBank, Shield } from "lucide-react";

interface Account {
  name: string;
  balance: number;
  icon: React.ReactNode;
  color: string;
}

export const AccountsOverview = () => {
  const accounts: Account[] = [
    {
      name: "Current Account",
      balance: 850.500,
      icon: <Wallet className="w-5 h-5" />,
      color: "text-primary",
    },
    {
      name: "Credit Card",
      balance: 500.000,
      icon: <CreditCard className="w-5 h-5" />,
      color: "text-warning",
    },
    {
      name: "Savings",
      balance: 2450.750,
      icon: <PiggyBank className="w-5 h-5" />,
      color: "text-success",
    },
    {
      name: "Emergency Fund",
      balance: 1000.000,
      icon: <Shield className="w-5 h-5" />,
      color: "text-accent-foreground",
    },
  ];

  const spendableBalance = accounts[0].balance + accounts[1].balance;

  return (
    <Card className="shadow-card xl:sticky xl:top-20">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-2xl">Accounts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
        <div className="p-3 sm:p-4 rounded-xl bg-gradient-primary text-primary-foreground">
          <p className="text-xs sm:text-sm opacity-90 mb-1">Total Spendable</p>
          <p className="text-2xl sm:text-3xl font-bold">{spendableBalance.toFixed(3)} KWD</p>
          <p className="text-[10px] sm:text-xs opacity-75 mt-1">Current + Credit</p>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {accounts.map((account) => (
            <div
              key={account.name}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`${account.color}`}>{account.icon}</div>
                <div>
                  <p className="font-medium text-xs sm:text-sm">{account.name}</p>
                </div>
              </div>
              <p className="font-semibold text-sm sm:text-base">{account.balance.toFixed(3)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
