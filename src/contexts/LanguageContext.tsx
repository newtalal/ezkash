import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    expenses: "Expenses",
    settings: "Settings",
    
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    username: "Username (optional)",
    signOut: "Sign Out",
    tryDemo: "Try Demo",
    
    // Dashboard
    spendingPower: "Spending Power",
    accounts: "Accounts",
    budgetSettings: "Budget Settings",
    monthlyBudget: "Monthly Budget",
    salaryDate: "Salary Date",
    save: "Save",
    
    // Transactions
    addTransaction: "Add Transaction",
    amount: "Amount",
    description: "Description",
    category: "Category",
    date: "Date",
    pasteTransaction: "Paste Bank Transaction (AI)",
    parseWithAI: "Parse with AI",
    cancel: "Cancel",
    
    // Categories
    food: "Food",
    transport: "Transport",
    shopping: "Shopping",
    bills: "Bills",
    entertainment: "Entertainment",
    health: "Health",
    other: "Other",
    
    // Settings
    languageSettings: "Language Settings",
    selectLanguage: "Select Language",
    english: "English",
    arabic: "Arabic",
    
    // Common
    getStarted: "Get Started",
    trackEveryDinar: "Track every dinar",
  },
  ar: {
    // Navigation
    dashboard: "لوحة التحكم",
    expenses: "المصروفات",
    settings: "الإعدادات",
    
    // Auth
    signIn: "تسجيل الدخول",
    signUp: "إنشاء حساب",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    username: "اسم المستخدم (اختياري)",
    signOut: "تسجيل الخروج",
    tryDemo: "تجربة العرض التوضيحي",
    
    // Dashboard
    spendingPower: "القوة الشرائية",
    accounts: "الحسابات",
    budgetSettings: "إعدادات الميزانية",
    monthlyBudget: "الميزانية الشهرية",
    salaryDate: "تاريخ الراتب",
    save: "حفظ",
    
    // Transactions
    addTransaction: "إضافة معاملة",
    amount: "المبلغ",
    description: "الوصف",
    category: "الفئة",
    date: "التاريخ",
    pasteTransaction: "لصق معاملة من البنك (ذكاء اصطناعي)",
    parseWithAI: "تحليل بالذكاء الاصطناعي",
    cancel: "إلغاء",
    
    // Categories
    food: "طعام",
    transport: "مواصلات",
    shopping: "تسوق",
    bills: "فواتير",
    entertainment: "ترفيه",
    health: "صحة",
    other: "أخرى",
    
    // Settings
    languageSettings: "إعدادات اللغة",
    selectLanguage: "اختر اللغة",
    english: "الإنجليزية",
    arabic: "العربية",
    
    // Common
    getStarted: "ابدأ الآن",
    trackEveryDinar: "تتبع كل دينار",
  },
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};
