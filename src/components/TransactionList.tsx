import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Transaction } from "@/pages/Dashboard";
import { format } from "date-fns";
import { Receipt, Trash2 } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export const TransactionList = ({ transactions, onDelete }: TransactionListProps) => {
  const { t } = useLanguage();
  
  const sortedTransactions = transactions
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const totalSpent = sortedTransactions
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Card className="shadow-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            {t("recentTransactions")}
          </CardTitle>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t("totalSpent")}</p>
            <p className="text-2xl font-bold text-destructive">
              {totalSpent.toFixed(3)} {t("kwd")}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>{t("noTransactions")}</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("category")}</TableHead>
                    <TableHead>{t("description")}</TableHead>
                    <TableHead>{t("payment")}</TableHead>
                    <TableHead className="text-right">{t("amount")}</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-accent/50">
                      <TableCell className="text-sm text-muted-foreground">
                        {format(transaction.date, "MMM d")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.category}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.description || "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {transaction.paymentMethod}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-destructive">
                        -{transaction.amount.toFixed(3)} {t("kwd")}
                      </TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this transaction? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => onDelete(transaction.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
