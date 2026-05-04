import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Filter, Eye, Pencil, X, CalendarCheck, Clock, Ban } from "lucide-react";
import { useState } from "react";
import { useCrm, type Booking, type BookingStatus, type PaymentStatus } from "@/lib/crm-store";
import { toast } from "sonner";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — RouteAura CRM" },
      { name: "description", content: "Manage all reservations, statuses and payments." },
    ],
  }),
  component: BookingsPage,
});

const statusBadge: Record<BookingStatus, string> = {
  Confirmed: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/20 text-warning-foreground border-warning/40",
  Cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

const payBadge: Record<PaymentStatus, string> = {
  Paid: "bg-success/15 text-success border-success/30",
  Pending: "bg-warning/20 text-warning-foreground border-warning/40",
  Refunded: "bg-muted text-muted-foreground border-border",
};

function BookingsPage() {
  const { bookings, rooms, updateBooking, deleteBooking } = useCrm();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");

  const [viewing, setViewing] = useState<Booking | null>(null);
  const [editing, setEditing] = useState<Booking | null>(null);
  const [deleting, setDeleting] = useState<Booking | null>(null);

  const filtered = bookings.filter((b) => {
    if (status !== "all" && b.status.toLowerCase() !== status) return false;
    if (q && !`${b.guest} ${b.room} ${b.id}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const summary = [
    { label: "Confirmed", value: bookings.filter((b) => b.status === "Confirmed").length, icon: CalendarCheck, tone: "text-success" },
    { label: "Pending",   value: bookings.filter((b) => b.status === "Pending").length,   icon: Clock,         tone: "text-warning-foreground" },
    { label: "Cancelled", value: bookings.filter((b) => b.status === "Cancelled").length, icon: Ban,           tone: "text-destructive" },
  ];

  const handleSaveEdit = (form: Booking) => {
    updateBooking(form.id, form);
    toast.success(`Booking ${form.id} updated`);
    setEditing(null);
  };

  const handleConfirmDelete = () => {
    if (!deleting) return;
    deleteBooking(deleting.id);
    toast.success(`Booking ${deleting.id} deleted`);
    setDeleting(null);
  };

  return (
    <DashboardLayout title="Bookings" subtitle="View and manage every reservation">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {summary.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card border border-border shadow-soft p-5 flex items-center justify-between hover-lift">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
            <div className="size-11 rounded-xl bg-secondary flex items-center justify-center">
              <s.icon className={`size-5 ${s.tone}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search guest, room or ID…" className="pl-9" />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full md:w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline"><Filter className="size-4" /> More filters</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="text-left font-medium px-5 py-3">Guest</th>
                <th className="text-left font-medium px-5 py-3">Room</th>
                <th className="text-left font-medium px-5 py-3">Check-in</th>
                <th className="text-left font-medium px-5 py-3">Check-out</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-left font-medium px-5 py-3">Payment</th>
                <th className="text-right font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-t border-border hover:bg-accent/30 transition">
                  <td className="px-5 py-3">
                    <div className="font-medium">{b.guest}</div>
                    <div className="text-xs text-muted-foreground">{b.id}</div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{b.room}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.checkIn}</td>
                  <td className="px-5 py-3 text-muted-foreground">{b.checkOut}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge[b.status]}`}>{b.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${payBadge[b.payment]}`}>{b.payment}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setViewing(b)} aria-label="View"><Eye className="size-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditing(b)} aria-label="Edit"><Pencil className="size-4" /></Button>
                      <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setDeleting(b)} aria-label="Delete"><X className="size-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No bookings match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Booking details</DialogTitle>
            <DialogDescription>{viewing?.id}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-3 text-sm">
              <Row label="Guest" value={viewing.guest} />
              <Row label="Room" value={viewing.room} />
              <Row label="Check-in" value={viewing.checkIn} />
              <Row label="Check-out" value={viewing.checkOut} />
              <Row label="Status" value={viewing.status} />
              <Row label="Payment" value={viewing.payment} />
              <Row label="Amount" value={`$${viewing.amount.toLocaleString()}`} />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            {viewing && (
              <Button className="gradient-primary text-primary-foreground" onClick={() => { setEditing(viewing); setViewing(null); }}>
                Edit booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      {editing && (
        <EditBookingDialog
          booking={editing}
          rooms={rooms.map((r) => r.name)}
          onCancel={() => setEditing(null)}
          onSave={handleSaveEdit}
        />
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete booking?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete booking {deleting?.id} for {deleting?.guest}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EditBookingDialog({
  booking,
  rooms,
  onCancel,
  onSave,
}: {
  booking: Booking;
  rooms: string[];
  onCancel: () => void;
  onSave: (b: Booking) => void;
}) {
  const [form, setForm] = useState<Booking>(booking);

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit booking</DialogTitle>
          <DialogDescription>{booking.id} · {booking.guest}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="room">Room</Label>
            <Select value={form.room} onValueChange={(v) => setForm({ ...form, room: v })}>
              <SelectTrigger id="room"><SelectValue /></SelectTrigger>
              <SelectContent>
                {rooms.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="ci">Check-in</Label>
              <Input id="ci" type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="co">Check-out</Label>
              <Input id="co" type="date" value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as BookingStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Payment</Label>
              <Select value={form.payment} onValueChange={(v) => setForm({ ...form, payment: v as PaymentStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="gradient-primary text-primary-foreground" onClick={() => onSave(form)}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
