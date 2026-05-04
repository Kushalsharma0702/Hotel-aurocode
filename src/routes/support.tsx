import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { tickets } from "@/lib/mock-data";
import { Send } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — RouteAura CRM" },
      { name: "description", content: "Customer messages and support tickets." },
    ],
  }),
  component: SupportPage,
});

const statusBadge = {
  Open: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/20 text-warning-foreground border-warning/40",
  Resolved: "bg-muted text-muted-foreground border-border",
} as const;

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function SupportPage() {
  const [active, setActive] = useState(tickets[0].id);
  const current = tickets.find((t) => t.id === active)!;

  return (
    <DashboardLayout title="Support" subtitle="Conversations and tickets from your guests">
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-5 h-[calc(100vh-10rem)]">
        <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden flex flex-col">
          <div className="p-4 border-b border-border">
            <h2 className="font-semibold tracking-tight">Inbox</h2>
            <p className="text-xs text-muted-foreground">{tickets.length} conversations</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {tickets.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "w-full text-left flex gap-3 p-4 border-b border-border transition",
                  active === t.id ? "bg-accent/60" : "hover:bg-accent/30",
                )}
              >
                <Avatar className="size-10 shrink-0">
                  <AvatarFallback className="gradient-primary text-primary-foreground text-xs font-semibold">
                    {initials(t.guest)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm truncate">{t.guest}</p>
                    <span className="text-[10px] text-muted-foreground shrink-0">{t.time}</span>
                  </div>
                  <p className="text-xs font-medium truncate">{t.subject}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.preview}</p>
                  <span className={`inline-flex mt-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusBadge[t.status as keyof typeof statusBadge]}`}>
                    {t.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-card border border-border shadow-soft flex flex-col overflow-hidden">
          <div className="p-5 border-b border-border flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                {initials(current.guest)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold">{current.guest}</p>
              <p className="text-xs text-muted-foreground">Ticket {current.id} · {current.subject}</p>
            </div>
            <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge[current.status as keyof typeof statusBadge]}`}>
              {current.status}
            </span>
          </div>

          <div className="flex-1 p-6 space-y-4 overflow-y-auto bg-background/40">
            <div className="flex gap-3 max-w-[80%]">
              <Avatar className="size-8 shrink-0"><AvatarFallback className="bg-secondary text-secondary-foreground text-xs">{initials(current.guest)}</AvatarFallback></Avatar>
              <div className="rounded-2xl rounded-tl-sm bg-card border border-border px-4 py-2.5 text-sm shadow-soft">
                {current.preview}
              </div>
            </div>
            <div className="flex gap-3 max-w-[80%] ml-auto flex-row-reverse">
              <Avatar className="size-8 shrink-0"><AvatarFallback className="gradient-primary text-primary-foreground text-xs">HM</AvatarFallback></Avatar>
              <div className="rounded-2xl rounded-tr-sm gradient-primary text-primary-foreground px-4 py-2.5 text-sm shadow-glow">
                Thanks for reaching out — I've flagged this for our concierge team. We'll have an update shortly.
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border flex items-center gap-2">
            <Input placeholder="Type your reply…" className="flex-1" />
            <Button className="gradient-primary text-primary-foreground hover:opacity-90"><Send className="size-4" /> Send</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
