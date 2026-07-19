import { useEffect, useMemo, useState } from "react";
import { DashboardNav } from "@/components/DashboardNav";
import { NavigationTabs } from "@/components/NavigationTabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { SpendingPieChart } from "@/components/SpendingPieChart";
import type { Transaction } from "@/pages/Dashboard";

const Reports = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (data) {
        setTransactions(
          data.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            category: t.category,
            description: t.description || "",
            paymentMethod: t.payment_method,
            date: new Date(t.date),
          }))
        );
      }
      setLoading(false);
    })();
  }, []);

  const now = new Date();

  const { thisMonth, lastMonth, pctChange } = useMemo(() => {
    const thisStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const sum = (from: Date, to: Date) =>
      transactions
        .filter((t) => t.date >= from && t.date < to)
        .reduce((s, t) => s + t.amount, 0);
    const thisMonth = sum(thisStart, nextStart);
    const lastMonth = sum(lastStart, thisStart);
    const pct = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : null;
    return { thisMonth, lastMonth, pctChange: pct };
  }, [transactions]);

  const weeklyData = useMemo(() => {
    const weeks: { label: string; total: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(end.getDate() - i * 7);
      const start = new Date(end);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      const total = transactions
        .filter((t) => t.date >= start && t.date <= end)
        .reduce((s, t) => s + t.amount, 0);
      weeks.push({
        label: `${start.getDate()}/${start.getMonth() + 1}`,
        total: Number(total.toFixed(3)),
      });
    }
    return weeks;
  }, [transactions]);

  const dailyData = useMemo(() => {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const arr = Array.from({ length: daysInMonth }, (_, i) => ({
      day: String(i + 1),
      total: 0,
    }));
    transactions.forEach((t) => {
      if (t.date.getMonth() === now.getMonth() && t.date.getFullYear() === now.getFullYear()) {
        arr[t.date.getDate() - 1].total += t.amount;
      }
    });
    return arr.map((d) => ({ ...d, total: Number(d.total.toFixed(3)) }));
  }, [transactions]);

  if (loading) {
    return (
      <div className="min-h-dvh bg-background">
        <DashboardNav />
        <NavigationTabs />
        <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-6">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  const trendUp = pctChange !== null && pctChange > 0;

  return (
    <div className="min-h-dvh bg-background">
      <DashboardNav />
      <NavigationTabs />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Monthly summary */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">This month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                {thisMonth.toFixed(3)} KWD
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Last month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">
                {lastMonth.toFixed(3)} KWD
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Change</CardTitle>
            </CardHeader>
            <CardContent>
              {pctChange === null ? (
                <div className="text-2xl font-bold text-muted-foreground">—</div>
              ) : (
                <div
                  className={`text-2xl sm:text-3xl font-bold flex items-center gap-2 ${
                    trendUp ? "text-destructive" : "text-emerald-600"
                  }`}
                >
                  {trendUp ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
                  {pctChange > 0 ? "+" : ""}
                  {pctChange.toFixed(1)}%
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">vs last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly trend */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
              Weekly trend (last 8 weeks)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => [`${v.toFixed(3)} KWD`, "Spent"]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily breakdown */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="text-lg">Daily spending — this month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => [`${v.toFixed(3)} KWD`, "Spent"]}
                  labelFormatter={(l) => `Day ${l}`}
                />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        <SpendingPieChart transactions={transactions} />
      </main>
    </div>
  );
};

export default Reports;