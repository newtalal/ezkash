import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Download, PieChart as PieChartIcon } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCurrentCycle } from "@/lib/cycleUtils";
import { toast } from "sonner";

interface Transaction {
  type: string;
  amount: number;
  category: string;
  date: Date;
}

interface SpendingPieChartProps {
  transactions: Transaction[];
  salaryDate?: number;
}

type RangeType = 'current' | 'last' | 'last30';

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
];

export const SpendingPieChart = ({ transactions, salaryDate = 20 }: SpendingPieChartProps) => {
  const { t, language } = useLanguage();
  const [range, setRange] = React.useState<RangeType>('current');

  const chartData = React.useMemo(() => {
    let startDate: Date;
    let endDate: Date;

    if (range === 'current') {
      const cycle = getCurrentCycle(salaryDate);
      startDate = cycle.startDate;
      endDate = cycle.endDate;
    } else if (range === 'last') {
      const currentCycle = getCurrentCycle(salaryDate);
      const prevMonth = new Date(currentCycle.startDate);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      startDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), salaryDate);
      endDate = new Date(currentCycle.startDate.getTime() - 1);
    } else {
      // Last 30 days
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    }

    // Filter and group transactions
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter(t => 
        t.type === 'expense' && 
        t.date >= startDate && 
        t.date <= endDate
      )
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    return {
      data: Object.entries(categoryTotals)
        .map(([name, value]) => ({
          name,
          value,
          percent: total > 0 ? (value / total) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value),
      total
    };
  }, [transactions, range, salaryDate]);

  const exportCSV = () => {
    if (chartData.data.length === 0) {
      toast.error(t('noDataToExport'));
      return;
    }

    const rangeLabel = range === 'current' ? t('thisCycle') : 
                       range === 'last' ? t('lastCycle') : 
                       t('last30Days');
    
    const csv = [
      ['Category', 'Amount (KWD)', 'Percentage'],
      ...chartData.data.map(item => [
        item.name,
        item.value.toFixed(3),
        item.percent.toFixed(1) + '%'
      ]),
      ['Total', chartData.total.toFixed(3), '100%']
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spending-by-category-${rangeLabel}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(t('exportSuccess'));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toFixed(3)} {t('kwd')} ({data.percent.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="p-4 sm:p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-2xl">
            <PieChartIcon className="w-5 h-5 text-primary" />
            {t('spendingByCategory')}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={range} onValueChange={(val) => setRange(val as RangeType)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">{t('thisCycle')}</SelectItem>
                <SelectItem value="last">{t('lastCycle')}</SelectItem>
                <SelectItem value="last30">{t('last30Days')}</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="icon"
              onClick={exportCSV}
              disabled={chartData.data.length === 0}
              title={t('exportCSV')}
            >
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        {chartData.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PieChartIcon className="w-16 h-16 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground max-w-sm">
              {t('noExpensesInRange')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={chartData.data}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={({ percent }) => `${percent.toFixed(1)}%`}
                  outerRadius={80}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  layout="horizontal" 
                  align="center"
                  verticalAlign="bottom"
                  wrapperStyle={{ paddingTop: '20px' }}
                  formatter={(value) => value}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground">{t('totalSpent')}</p>
              <p className="text-2xl font-bold text-primary">
                {chartData.total.toFixed(3)} {t('kwd')}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
