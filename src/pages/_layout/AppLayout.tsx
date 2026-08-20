import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Building2, Wrench, Receipt, FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils.ts";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import { useEffect, useRef } from "react";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/properties", label: "Properties", icon: Building2, exact: false },
  { to: "/tasks", label: "Tasks", icon: Wrench, exact: false },
  { to: "/expenses", label: "Expenses", icon: Receipt, exact: false },
  { to: "/report", label: "Report", icon: FileText, exact: false },
];

export default function AppLayout() {
  const seedData = useMutation(api.seed.seedData);
  const seeded = useRef(false);

  useEffect(() => {
    if (!seeded.current) {
      seeded.current = true;
      seedData().catch(console.error);
    }
  }, [seedData]);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-sidebar shrink-0 border-r border-sidebar-border">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 text-accent-foreground" />
            </div>
            <div className="leading-none">
              <p className="text-[13px] font-bold text-sidebar-foreground tracking-tight">PropertyOps</p>
              <p className="text-[10px] text-sidebar-foreground/40 mt-0.5">by Evox</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/50 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground/80"
                )
              }
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Demo tag */}
        <div className="px-3 py-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-accent/10 border border-accent/20">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] text-accent font-medium">Demo — Aug 2026</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-sidebar border-b border-sidebar-border no-print">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center">
              <Zap className="w-3 h-3 text-accent-foreground" />
            </div>
            <span className="font-bold text-[13px] text-sidebar-foreground">PropertyOps</span>
          </div>
          <span className="text-[10px] text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">Demo</span>
        </header>

        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          <Outlet />
        </main>

        {/* Bottom nav mobile */}
        <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t bg-sidebar border-sidebar-border md:hidden no-print z-50 px-2 py-1">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md cursor-pointer transition-colors",
                  isActive ? "text-accent" : "text-sidebar-foreground/40"
                )
              }
            >
              <Icon className="w-4 h-4" />
              <span className="text-[9px] font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
