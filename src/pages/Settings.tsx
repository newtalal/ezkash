import { DashboardNav } from "@/components/DashboardNav";
import { NavigationTabs } from "@/components/NavigationTabs";
import { LanguageSettings } from "@/components/LanguageSettings";
import { AccountSettings } from "@/components/AccountSettings";
import { AppearanceSettings } from "@/components/AppearanceSettings";
import { ExportExpenses } from "@/components/ExportExpenses";

const Settings = () => {
  return (
    <div className="min-h-dvh bg-background w-full max-w-full overflow-x-hidden pb-[calc(env(safe-area-inset-bottom)+16px)]">
      <DashboardNav />
      <NavigationTabs />
      <main className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          <LanguageSettings />
          <AccountSettings />
          <AppearanceSettings />
        </div>
        <ExportExpenses />
      </main>
    </div>
  );
};

export default Settings;
