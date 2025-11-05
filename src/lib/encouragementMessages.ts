import { getCurrentCycle } from "./cycleUtils";

export interface EncouragementData {
  category: string;
  catTotalKWD: number;
  countThisWeek: number;
  remainingBudgetKWD: number;
}

export const getEncouragementMessage = (
  data: EncouragementData,
  language: 'en' | 'ar'
): string => {
  const messages = language === 'en' ? messagesEN : messagesAR;
  const randomIndex = Math.floor(Math.random() * messages.length);
  const template = messages[randomIndex];
  
  return template
    .replace('{category}', data.category)
    .replace('{catTotalKWD}', data.catTotalKWD.toFixed(3))
    .replace('{countThisWeek}', data.countThisWeek.toString())
    .replace('{remainingBudgetKWD}', data.remainingBudgetKWD.toFixed(3));
};

const messagesEN = [
  "Nice! You're keeping tabs on every dinar. ✅",
  "Logged! {category} now totals {catTotalKWD} KWD this cycle.",
  "You've added {countThisWeek} expenses this week—keep the streak going! 🔥",
  "Only {remainingBudgetKWD} KWD left in your spendable—great awareness.",
  "Expense tracked! {category} is at {catTotalKWD} KWD for this cycle. 📊",
  "Great job logging that! You're {countThisWeek} transactions strong this week. 💪",
  "Awesome! Staying on top of your finances with {remainingBudgetKWD} KWD remaining. 🎯",
];

const messagesAR = [
  "ممتاز! تتابع كل دينار ✅",
  "تمت الإضافة! فئة {category} وصلت إلى {catTotalKWD} د.ك خلال الدورة.",
  "سجّلت {countThisWeek} مصروفات هذا الأسبوع—كمل السلسلة! 🔥",
  "المتبقي {remainingBudgetKWD} د.ك من الميزانية المتاحة—واعي جدًا 👍",
  "تم التسجيل! فئة {category} عند {catTotalKWD} د.ك لهذه الدورة. 📊",
  "عمل رائع! أنت عند {countThisWeek} معاملة هذا الأسبوع. 💪",
  "رائع! متابع مالياتك والمتبقي {remainingBudgetKWD} د.ك. 🎯",
];

export const calculateEncouragementData = (
  category: string,
  transactions: Array<{ type: string; amount: number; category: string; date: Date }>,
  totalSpendable: number,
  unpaidFixed: number,
  unpaidOneTime: number,
  salaryDate: number
): EncouragementData => {
  const { startDate, endDate } = getCurrentCycle(salaryDate);
  
  // Category total for current cycle
  const catTotalKWD = transactions
    .filter(t => 
      t.type === 'expense' && 
      t.category === category &&
      t.date >= startDate &&
      t.date <= endDate
    )
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Expenses count for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const countThisWeek = transactions.filter(t => 
    t.type === 'expense' && t.date >= sevenDaysAgo
  ).length;
  
  // Total spent this cycle
  const spentThisCycle = transactions
    .filter(t => 
      t.type === 'expense' &&
      t.date >= startDate &&
      t.date <= endDate
    )
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Remaining budget
  const remainingBudgetKWD = totalSpendable - unpaidFixed - unpaidOneTime - spentThisCycle;
  
  return {
    category,
    catTotalKWD,
    countThisWeek,
    remainingBudgetKWD: Math.max(0, remainingBudgetKWD)
  };
};
