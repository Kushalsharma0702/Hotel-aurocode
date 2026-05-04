import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  gradient: "gradient-card-1" | "gradient-card-2" | "gradient-card-3" | "gradient-card-4";
}

export function StatCard({ title, value, change, icon: Icon, gradient }: StatCardProps) {
  const positive = change >= 0;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 border border-border/50 hover-lift shadow-soft",
        gradient,
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-foreground/70 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <div className="size-11 rounded-xl bg-white/60 backdrop-blur flex items-center justify-center shadow-soft">
          <Icon className="size-5 text-primary" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
        {positive ? (
          <TrendingUp className="size-3.5 text-success" />
        ) : (
          <TrendingDown className="size-3.5 text-destructive" />
        )}
        <span className={positive ? "text-success" : "text-destructive"}>
          {positive ? "+" : ""}{change}%
        </span>
        <span className="text-muted-foreground">vs last month</span>
      </div>
    </div>
  );
}
