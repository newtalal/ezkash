import { NavLink } from "react-router-dom";
import { LayoutDashboard, Settings, Receipt } from "lucide-react";

export const NavigationTabs = () => {
  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/settings", icon: Settings, label: "Settings" },
    { to: "/expenses", icon: Receipt, label: "Expenses" },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-[56px] sm:top-[64px] z-40">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
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
