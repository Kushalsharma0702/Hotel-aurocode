import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { payments, revenueByMonth } from "@/lib/mock-data";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Payments & Revenue — RouteAura CRM" },
      { name: "description", content: "Revenue trends and payment history." },
    ],
  }),
  component: PaymentsPage,
});

const payBadge = {
  Paid: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/20 text-warning-foreground border-warning/40",
  Refunded: "bg-muted text-muted-foreground border-border",
} as const;

function PaymentsPage() {
  const totalRevenue = revenueByMonth.reduce((s, m) => s + m.revenue, 0);
  const totalBookings = revenueByMonth.reduce((s, m) => s + m.bookings, 0);
  const avg = Math.round(totalRevenue / totalBookings);

  return (
    <DashboardLayout title="Payments & Revenue" subtitle="Track earnings and transaction history">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total revenue", value: `$${(totalRevenue / 1000).toFixed(0)}K`, sub: "Last 6 months", grad: "gradient-card-1" },
          { label: "Avg. order value", value: `$${avg}`, sub: "Per booking", grad: "gradient-card-2" },
          { label: "Bookings", value: totalBookings.toLocaleString(), sub: "Last 6 months", grad: "gradient-card-3" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl p-5 border border-border/50 shadow-soft hover-lift ${s.grad}`}>
            <p className="text-xs uppercase tracking-wider text-foreground/70">{s.label}</p>
            <p className="text-3xl font-bold mt-1.5">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft p-5 mb-6">
        <h2 className="font-semibold tracking-tight mb-4">Monthly earnings</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueByMonth} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Line type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 5, fill: "var(--color-primary)" }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold tracking-tight">Payment history</h2>
          <p className="text-xs text-muted-foreground">Recent transactions</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-5 py-3">Transaction ID</th>
                <th className="text-left font-medium px-5 py-3">Guest</th>
                <th className="text-left font-medium px-5 py-3">Date</th>
                <th className="text-left font-medium px-5 py-3">Method</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-right font-medium px-5 py-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-accent/30 transition">
                  <td className="px-5 py-3 font-mono text-xs">{p.id}</td>
                  <td className="px-5 py-3 font-medium">{p.guest}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.date}</td>
                  <td className="px-5 py-3 text-muted-foreground">{p.method}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${payBadge[p.status as keyof typeof payBadge]}`}>{p.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold">${p.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
