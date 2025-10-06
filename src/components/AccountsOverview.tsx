import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, CreditCard, PiggyBank, Shield } from "lucide-react";

export interface Account {
  id: string;
  name: string;
  balance: number;
  iconType: string;
  color: string;
  isSpendable: boolean;
}

const getIcon = (iconType: string) => {
  const icons: Record<string, React.ReactNode> = {
    wallet: <Wallet className="w-5 h-5" />,
    creditCard: <CreditCard className="w-5 h-5" />,
    piggyBank: <PiggyBank className="w-5 h-5" />,
    shield: <Shield className="w-5 h-5" />,
  };
  return icons[iconType] || <Wallet className="w-5 h-5" />;
};

export const AccountsOverview = () => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem("accounts");
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      {
        id: "1",
        name: "Current Account",
        balance: 850.500,
        iconType: "wallet",
        color: "text-primary",
        isSpendable: true,
      },
      {
        id: "2",
        name: "Credit Card",
        balance: 500.000,
        iconType: "creditCard",
        color: "text-warning",
        isSpendable: true,
      },
      {
        id: "3",
        name: "Savings",
        balance: 2450.750,
        iconType: "piggyBank",
        color: "text-success",
        isSpendable: false,
      },
      {
        id: "4",
        name: "Emergency Fund",
        balance: 1000.000,
        iconType: "shield",
        color: "text-accent-foreground",
        isSpendable: false,
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("accounts", JSON.stringify(accounts));
  }, [accounts]);

  const spendableBalance = accounts
    .filter(account => account.isSpendable)
    .reduce((sum, account) => sum + account.balance, 0);

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
              key={account.id}
              className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`${account.color}`}>{getIcon(account.iconType)}</div>
                <div>
                  <p className="font-medium text-xs sm:text-sm">{account.name}</p>
                  {account.isSpendable && (
                    <p className="text-[10px] text-muted-foreground">Spendable</p>
                  )}
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
