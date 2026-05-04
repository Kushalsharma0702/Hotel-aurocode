import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { CalendarCheck, DollarSign, Percent, BedDouble, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { revenueByMonth, occupancyByDay, aiInsights } from "@/lib/mock-data";
import { useCrm } from "@/lib/crm-store";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — RouteAura CRM" },
      { name: "description", content: "Overview of bookings, revenue, occupancy and AI insights." },
    ],
  }),
  component: DashboardPage,
});

const statusVariant = {
  Confirmed: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/20 text-warning-foreground border-warning/40",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
} as const;

function DashboardPage() {
  const { bookings, stats, loading } = useCrm();
  return (
    <DashboardLayout title="Welcome back, Manager 👋" subtitle="Here's what's happening at RouteAura today">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
        <StatCard title="Total Bookings" value={String(stats?.total_bookings ?? 0)} change={0} icon={CalendarCheck} gradient="gradient-card-1" />
        <StatCard title="Total Revenue"  value={`$${((stats?.total_revenue ?? 0) / 1000).toFixed(0)}K`}  change={0}  icon={DollarSign}    gradient="gradient-card-2" />
        <StatCard title="Occupancy Rate" value={`${stats?.occupancy_rate ?? 0}%`}    change={0}  icon={Percent}       gradient="gradient-card-3" />
        <StatCard title="Available Rooms" value={String(stats?.available_rooms ?? 0)}    change={0} icon={BedDouble}     gradient="gradient-card-4" />
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 rounded-2xl bg-card border border-border shadow-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold tracking-tight">Revenue overview</h2>
              <p className="text-xs text-muted-foreground">Last 6 months</p>
            </div>
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground">+18.2%</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByMonth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-soft p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold tracking-tight">Occupancy this week</h2>
              <p className="text-xs text-muted-foreground">Daily rate %</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyByDay} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="rate" fill="var(--color-primary-glow)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h2 className="font-semibold tracking-tight">Recent bookings</h2>
              <p className="text-xs text-muted-foreground">Latest reservations across all rooms</p>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to="/bookings">View all <ArrowRight className="size-4" /></Link>
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Guest</th>
                  <th className="text-left font-medium px-5 py-3">Room</th>
                  <th className="text-left font-medium px-5 py-3">Check-in</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="text-right font-medium px-5 py-3">Amount</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map((b) => (
                  <tr key={b.id} className="border-t border-border hover:bg-accent/40 transition">
                    <td className="px-5 py-3 font-medium">{b.guest}</td>
                    <td className="px-5 py-3 text-muted-foreground">{b.room}</td>
                    <td className="px-5 py-3 text-muted-foreground">{b.checkIn}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusVariant[b.status]}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-semibold">${b.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl gradient-soft-blue border border-border shadow-soft p-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="size-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="size-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold tracking-tight">AI Hotel Insights</h2>
              <p className="text-[11px] text-muted-foreground">Personalized recommendations</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {aiInsights.slice(0, 3).map((i) => (
              <div key={i.title} className="rounded-xl bg-card/70 backdrop-blur border border-border/60 p-3 hover-lift">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{i.title}</p>
                  <span className="text-[10px] font-semibold text-primary whitespace-nowrap">{i.impact}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{i.detail}</p>
              </div>
            ))}
          </div>
          <Button asChild className="w-full mt-4 gradient-primary text-primary-foreground hover:opacity-90">
            <Link to="/insights">Explore all insights</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
