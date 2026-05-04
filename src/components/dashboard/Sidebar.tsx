import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  BedDouble,
  Users,
  CreditCard,
  BarChart3,
  Sparkles,
  LifeBuoy,
  Plane,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Bookings", url: "/bookings", icon: CalendarCheck },
  { title: "Packages", url: "/packages", icon: Package },
  { title: "Package Catalog", url: "/package-catalog", icon: Package },
  { title: "Rooms", url: "/rooms", icon: BedDouble },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Payments", url: "/payments", icon: CreditCard },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "AI Insights", url: "/insights", icon: Sparkles },
  { title: "Support", url: "/support", icon: LifeBuoy },
];

export function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 h-16 border-b border-sidebar-border">
        <div className="size-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <Plane className="size-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-sidebar-foreground tracking-tight">RouteAura</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Hotel CRM</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Main
        </p>
        {items.map((it) => {
          const active = path === it.url;
          return (
            <Link
              key={it.url}
              to={it.url}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "gradient-primary text-primary-foreground shadow-glow"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <it.icon className="size-4" />
              <span>{it.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="m-3 rounded-2xl gradient-soft-blue p-4 border border-border/60">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="size-4 text-primary" />
          <span className="text-xs font-semibold text-primary">Pro Tip</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Enable AI insights to get weekly demand & pricing recommendations.
        </p>
      </div>
    </div>
  );
}

export function AppSidebar() {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar sticky top-0 h-screen">
      <SidebarBody />
    </aside>
  );
}
