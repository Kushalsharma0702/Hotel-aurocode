import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Filter, Mail, Phone, Crown } from "lucide-react";
import { useState } from "react";
import { useCrm, type Customer } from "@/lib/crm-store";
import { toast } from "sonner";

export const Route = createFileRoute("/customers")({
  head: () => ({
    meta: [
      { title: "Customers — RouteAura CRM" },
      { name: "description", content: "Customer profiles, history and contact details." },
    ],
  }),
  component: CustomersPage,
});

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function CustomersPage() {
  const { customers, bookings, addCustomer } = useCrm();
  const [q, setQ] = useState("");
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [adding, setAdding] = useState(false);

  const filtered = customers.filter((c) =>
    `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q.toLowerCase()),
  );

  const customerHistory = (name: string) => bookings.filter((b) => b.guest === name);

  return (
    <DashboardLayout title="Customers" subtitle="Profiles, contact details and stay history">
      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search customers…" className="pl-9" />
          </div>
          <Button variant="outline"><Filter className="size-4" /> Filters</Button>
          <Button className="gradient-primary text-primary-foreground hover:opacity-90" onClick={() => setAdding(true)}>
            + Add customer
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-5">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border p-5 bg-background/40 hover-lift">
              <div className="flex items-center gap-3">
                <Avatar className="size-12">
                  <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                    {initials(c.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold truncate">{c.name}</p>
                    {c.vip && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-warning-foreground bg-warning/30 rounded-full px-1.5 py-0.5">
                        <Crown className="size-3" /> VIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Last stay {c.lastStay}</p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Mail className="size-3.5" /> {c.email}</div>
                <div className="flex items-center gap-2"><Phone className="size-3.5" /> {c.phone}</div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold">{c.bookings}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Bookings</p>
                </div>
                <Button size="sm" className="gradient-primary text-primary-foreground hover:opacity-90" onClick={() => setViewing(c)}>
                  View profile
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">No customers match your search.</div>
          )}
        </div>
      </div>

      {/* View profile */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Customer profile</DialogTitle>
            <DialogDescription>Booking history and contact information</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-14">
                  <AvatarFallback className="gradient-primary text-primary-foreground font-semibold">
                    {initials(viewing.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{viewing.name}</p>
                    {viewing.vip && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-warning-foreground bg-warning/30 rounded-full px-1.5 py-0.5">
                        <Crown className="size-3" /> VIP
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Last stay {viewing.lastStay}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Bookings</p>
                  <p className="text-xl font-bold">{viewing.bookings}</p>
                </div>
                <div className="rounded-xl border border-border p-3">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total spend</p>
                  <p className="text-xl font-bold">
                    ${customerHistory(viewing.name).reduce((s, b) => s + b.amount, 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5 text-sm">
                <div className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> {viewing.email}</div>
                <div className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" /> {viewing.phone}</div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Recent bookings</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {customerHistory(viewing.name).map((b) => (
                    <div key={b.id} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-sm">
                      <div>
                        <p className="font-medium">{b.room}</p>
                        <p className="text-xs text-muted-foreground">{b.checkIn} → {b.checkOut}</p>
                      </div>
                      <p className="font-semibold">${b.amount.toLocaleString()}</p>
                    </div>
                  ))}
                  {customerHistory(viewing.name).length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No bookings yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add customer */}
      {adding && (
        <AddCustomerDialog
          onCancel={() => setAdding(false)}
          onSubmit={(c) => {
            addCustomer(c);
            toast.success(`${c.name} added`);
            setAdding(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}

function AddCustomerDialog({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (c: { name: string; email: string; phone: string }) => void;
}) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const valid = form.name.trim() && form.email.trim() && form.phone.trim();

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add customer</DialogTitle>
          <DialogDescription>Create a new customer profile.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@example.com" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 555 0123" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="gradient-primary text-primary-foreground" disabled={!valid} onClick={() => onSubmit(form)}>
            Add customer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
