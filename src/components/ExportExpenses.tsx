import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import * as XLSX from "xlsx";
import { getCurrentCycle } from "@/lib/cycleUtils";

export const ExportExpenses = () => {
  const { t, language } = useLanguage();
  const [isExporting, setIsExporting] = useState(false);

  const formatCycle = (date: Date, salaryDate: number): string => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Determine which cycle this transaction belongs to
    if (day >= salaryDate) {
      // Current month cycle (e.g., 2025-01 (20→19))
      return `${year}-${String(month + 1).padStart(2, '0')} (${salaryDate}→${salaryDate - 1})`;
    } else {
      // Previous month cycle
      return `${year}-${String(month).padStart(2, '0')} (${salaryDate}→${salaryDate - 1})`;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error(t("exportFailed"));
        return;
      }

      // Fetch user settings for salary date
      const { data: settingsData } = await supabase
        .from('user_settings')
        .select('salary_date')
        .eq('user_id', user.id)
        .single();

      const salaryDate = settingsData?.salary_date || 20;

      // Fetch all expense transactions
      const { data: transactionsData, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .order('date', { ascending: false });

      if (error) throw error;

      if (!transactionsData || transactionsData.length === 0) {
        toast.error(t("noDataToExport"));
        setIsExporting(false);
        return;
      }

      // Prepare data for Excel
      const excelData = transactionsData.map(t => {
        const transactionDate = new Date(t.date);
        return {
          [language === 'ar' ? 'معرف المعاملة' : 'Transaction ID']: t.id,
          [language === 'ar' ? 'التاريخ' : 'Date']: transactionDate,
          [language === 'ar' ? 'الدورة' : 'Cycle']: formatCycle(transactionDate, salaryDate),
          [language === 'ar' ? 'الفئة' : 'Category']: t.category,
          [language === 'ar' ? 'الوصف' : 'Description']: t.description || '',
          [language === 'ar' ? 'المبلغ (د.ك)' : 'Amount (KWD)']: Number(t.amount),
          [language === 'ar' ? 'طريقة الدفع / الحساب' : 'Payment Method / Account']: t.payment_method,
          [language === 'ar' ? 'تاريخ الإنشاء' : 'Created At']: new Date(t.created_at),
          [language === 'ar' ? 'تاريخ التحديث' : 'Updated At']: new Date(t.updated_at)
        };
      });

      // Calculate total
      const total = transactionsData.reduce((sum, t) => sum + Number(t.amount), 0);

      // Add totals row
      const totalsRow = {
        [language === 'ar' ? 'معرف المعاملة' : 'Transaction ID']: '',
        [language === 'ar' ? 'التاريخ' : 'Date']: '',
        [language === 'ar' ? 'الدورة' : 'Cycle']: '',
        [language === 'ar' ? 'الفئة' : 'Category']: '',
        [language === 'ar' ? 'الوصف' : 'Description']: language === 'ar' ? 'الإجمالي' : 'TOTAL',
        [language === 'ar' ? 'المبلغ (د.ك)' : 'Amount (KWD)']: total,
        [language === 'ar' ? 'طريقة الدفع / الحساب' : 'Payment Method / Account']: '',
        [language === 'ar' ? 'تاريخ الإنشاء' : 'Created At']: '',
        [language === 'ar' ? 'تاريخ التحديث' : 'Updated At']: ''
      };

      excelData.push(totalsRow);

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Set column widths
      const colWidths = [
        { wch: 38 }, // Transaction ID
        { wch: 12 }, // Date
        { wch: 20 }, // Cycle
        { wch: 20 }, // Category
        { wch: 40 }, // Description
        { wch: 15 }, // Amount
        { wch: 25 }, // Payment Method
        { wch: 18 }, // Created At
        { wch: 18 }  // Updated At
      ];
      ws['!cols'] = colWidths;

      // Format dates and numbers
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let row = range.s.r + 1; row <= range.e.r; row++) {
        // Date column (B)
        const dateCell = ws[XLSX.utils.encode_cell({ r: row, c: 1 })];
        if (dateCell && dateCell.t === 'd') {
          dateCell.z = 'DD-MM-YYYY';
        }

        // Amount column (F)
        const amountCell = ws[XLSX.utils.encode_cell({ r: row, c: 5 })];
        if (amountCell && typeof amountCell.v === 'number') {
          amountCell.z = '0.000';
        }

        // Created At column (H)
        const createdCell = ws[XLSX.utils.encode_cell({ r: row, c: 7 })];
        if (createdCell && createdCell.t === 'd') {
          createdCell.z = 'DD-MM-YYYY HH:mm';
        }

        // Updated At column (I)
        const updatedCell = ws[XLSX.utils.encode_cell({ r: row, c: 8 })];
        if (updatedCell && updatedCell.t === 'd') {
          updatedCell.z = 'DD-MM-YYYY HH:mm';
        }
      }

      // Freeze first row
      ws['!freeze'] = { xSplit: 0, ySplit: 1 };

      // Add worksheet to workbook
      const sheetName = language === 'ar' ? 'المصروفات' : 'Expenses';
      XLSX.utils.book_append_sheet(wb, ws, sheetName);

      // Generate filename
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 16).replace('T', '_').replace(/:/g, '-');
      const filename = `EzKash_Expenses_${timestamp}_user-${user.id.slice(0, 8)}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      toast.success(t("exportSuccessExcel"));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t("exportFailed"));
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          {t("exportAllExpenses")}
        </CardTitle>
        <CardDescription>
          {t("exportDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleExport}
          disabled={isExporting}
          className="w-full"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("exporting")}
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              {t("exportToExcel")}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
