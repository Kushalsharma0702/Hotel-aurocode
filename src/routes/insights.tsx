import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Button } from "@/components/ui/button";
import { aiInsights } from "@/lib/mock-data";
import { Sparkles, TrendingUp, Flame, CalendarX, Heart, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "AI Insights — RouteAura CRM" },
      { name: "description", content: "AI-powered hotel pricing, demand and loyalty recommendations." },
    ],
  }),
  component: InsightsPage,
});

const iconFor: Record<string, React.ComponentType<{ className?: string }>> = {
  pricing: TrendingUp,
  demand: Flame,
  occupancy: CalendarX,
  loyalty: Heart,
};

function InsightsPage() {
  return (
    <DashboardLayout title="AI Hotel Insights" subtitle="Smart recommendations to boost revenue and occupancy">
      <div className="rounded-3xl gradient-primary text-primary-foreground p-6 md:p-8 shadow-glow mb-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 size-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 size-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur px-3 py-1 text-xs font-semibold mb-3">
            <Sparkles className="size-3.5" /> Powered by AI
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight max-w-2xl">
            Your hotel could earn <span className="underline decoration-white/40">+$22,400</span> next month
          </h2>
          <p className="mt-2 text-primary-foreground/80 max-w-xl">
            Based on demand signals, competitor pricing and guest behavior, we've identified 4 high-impact opportunities.
          </p>
          <Button size="lg" variant="secondary" className="mt-5 bg-white text-primary hover:bg-white/90">
            Apply all suggestions <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {aiInsights.map((i) => {
          const Icon = iconFor[i.kind] ?? Sparkles;
          return (
            <div key={i.title} className="rounded-2xl bg-card border border-border shadow-soft p-5 hover-lift">
              <div className="flex items-start justify-between gap-4">
                <div className="size-11 rounded-xl gradient-soft-blue flex items-center justify-center">
                  <Icon className="size-5 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary bg-secondary px-2.5 py-1 rounded-full">
                  {i.impact}
                </span>
              </div>
              <h3 className="mt-4 font-semibold tracking-tight">{i.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{i.detail}</p>
              <div className="mt-5 flex gap-2">
                <Button size="sm" className="gradient-primary text-primary-foreground hover:opacity-90">Apply</Button>
                <Button size="sm" variant="outline">Dismiss</Button>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
