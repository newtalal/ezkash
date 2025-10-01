import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/pages/Dashboard";
import { format } from "date-fns";
import { Receipt } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  const todayTransactions = transactions.filter(
    (t) => format(t.date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  );

  const totalSpentToday = todayTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Today's Transactions
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Spent</p>
            <p className="text-2xl font-bold text-destructive">
              {totalSpentToday.toFixed(3)} KWD
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {todayTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No transactions today</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayTransactions.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-accent/50">
                    <TableCell className="font-medium">
                      {transaction.category}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {transaction.description || "-"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {transaction.paymentMethod}
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        transaction.type === "income"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {transaction.amount.toFixed(3)} KWD
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
