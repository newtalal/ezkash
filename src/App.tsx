import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AppThemeInitializer } from "@/hooks/useAppTheme";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ForgotUsername from "./pages/ForgotUsername";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import ProfileSecurity from "./pages/ProfileSecurity";
import Accounts from "./pages/Accounts";
import Expenses from "./pages/Expenses";
import FixedExpenses from "./pages/FixedExpenses";
import OneTimeExpenses from "./pages/OneTimeExpenses";
import Categories from "./pages/Categories";
import NotFound from "./pages/NotFound";

function App() {
  const queryClient = React.useMemo(() => new QueryClient(), []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <AppThemeInitializer />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/forgot-username" element={<ForgotUsername />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/fixed-expenses" element={<FixedExpenses />} />
              <Route path="/one-time-expenses" element={<OneTimeExpenses />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile-security" element={<ProfileSecurity />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
