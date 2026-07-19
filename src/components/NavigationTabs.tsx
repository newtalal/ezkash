import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Settings, Receipt, Wallet, CalendarClock, CalendarCheck, Tag } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useRef } from "react";

export const NavigationTabs = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLAnchorElement>(null);
  
  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: t("dashboard") },
    { to: "/expenses", icon: Receipt, label: t("expenses") },
    { to: "/fixed-expenses", icon: CalendarClock, label: t("fixedExpenses") },
    { to: "/one-time-expenses", icon: CalendarCheck, label: t("oneTimeExpenses") },
    { to: "/accounts", icon: Wallet, label: t("accounts") },
    { to: "/categories", icon: Tag, label: "Categories" },
    { to: "/settings", icon: Settings, label: t("settings") },
  ];

  // Scroll active tab into view when route changes
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [location.pathname]);

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-[56px] sm:top-[64px] z-40">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
        <div ref={scrollContainerRef} className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              ref={(el) => {
                if (location.pathname === item.to) {
                  activeTabRef.current = el;
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};
