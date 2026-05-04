import { createFileRoute } from "@tanstack/react-router";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Wifi, Snowflake, Waves, Coffee, Sparkles, UserCog, Pencil, Search } from "lucide-react";
import { useState } from "react";
import { useCrm, type Room } from "@/lib/crm-store";
import { toast } from "sonner";

export const Route = createFileRoute("/rooms")({
  head: () => ({
    meta: [
      { title: "Rooms — RouteAura CRM" },
      { name: "description", content: "Manage room inventory, pricing and amenities." },
    ],
  }),
  component: RoomsPage,
});

const amenityIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  WiFi: Wifi,
  AC: Snowflake,
  Pool: Waves,
  Breakfast: Coffee,
  Spa: Sparkles,
  Lounge: Coffee,
  Butler: UserCog,
};

const ALL_AMENITIES = ["WiFi", "AC", "Pool", "Breakfast", "Spa", "Lounge", "Butler"];
const ROOM_TYPES = ["Standard", "Deluxe", "Suite", "Presidential"];

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 10'><rect width='16' height='10' fill='%23dbeafe'/><text x='8' y='6' font-size='1.2' text-anchor='middle' fill='%231e40af'>New room</text></svg>";

type FormState = {
  name: string;
  type: string;
  price: number;
  amenities: string[];
  available: boolean;
  image: string;
};

function emptyForm(): FormState {
  return { name: "", type: "Deluxe", price: 200, amenities: ["WiFi", "AC"], available: true, image: PLACEHOLDER_IMG };
}

function RoomsPage() {
  const { rooms, addRoom, updateRoom, toggleRoomAvailability } = useCrm();
  const [q, setQ] = useState("");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Room | null>(null);
  const [managing, setManaging] = useState<Room | null>(null);

  const filtered = rooms.filter((r) =>
    `${r.name} ${r.type}`.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <DashboardLayout title="Rooms" subtitle="Inventory, pricing and amenities at a glance">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
        <div className="flex gap-2 text-sm text-muted-foreground">
          <span><b className="text-foreground">{rooms.length}</b> total</span>
          <span>·</span>
          <span><b className="text-success">{rooms.filter(r => r.available).length}</b> available</span>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search rooms…" className="pl-9" />
          </div>
          <Button className="gradient-primary text-primary-foreground hover:opacity-90" onClick={() => setAdding(true)}>
            + Add room
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((r) => (
          <div key={r.id} className="group rounded-2xl bg-card border border-border shadow-soft overflow-hidden hover-lift">
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={r.image}
                alt={r.name}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className="inline-flex rounded-full backdrop-blur bg-card/80 border border-border px-2.5 py-1 text-xs font-semibold">
                  {r.type}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                  r.available ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
                }`}>
                  {r.available ? "Available" : "Occupied"}
                </span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold tracking-tight">{r.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Premium category</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold tracking-tight">${r.price}</p>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">/ night</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {r.amenities.map((a) => {
                  const Icon = amenityIcon[a] ?? Sparkles;
                  return (
                    <span key={a} className="inline-flex items-center gap-1 rounded-md bg-secondary text-secondary-foreground px-2 py-1 text-[11px] font-medium">
                      <Icon className="size-3" /> {a}
                    </span>
                  );
                })}
              </div>

              <div className="mt-5 flex gap-2">
                <Button className="flex-1 gradient-primary text-primary-foreground hover:opacity-90" onClick={() => setManaging(r)}>
                  Manage
                </Button>
                <Button variant="outline" size="icon" onClick={() => setEditing(r)} aria-label="Edit"><Pencil className="size-4" /></Button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">No rooms match your search.</div>
        )}
      </div>

      {adding && (
        <RoomFormDialog
          title="Add room"
          initial={emptyForm()}
          onCancel={() => setAdding(false)}
          onSubmit={(f) => {
            addRoom(f);
            toast.success(`Room "${f.name}" added`);
            setAdding(false);
          }}
        />
      )}

      {editing && (
        <RoomFormDialog
          title="Edit room"
          initial={{
            name: editing.name,
            type: editing.type,
            price: editing.price,
            amenities: editing.amenities,
            available: editing.available,
            image: editing.image,
          }}
          onCancel={() => setEditing(null)}
          onSubmit={(f) => {
            updateRoom(editing.id, f);
            toast.success(`Room "${f.name}" updated`);
            setEditing(null);
          }}
        />
      )}

      {managing && (
        <Dialog open onOpenChange={(o) => !o && setManaging(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{managing.name}</DialogTitle>
              <DialogDescription>{managing.type} · Manage availability and pricing</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <img src={managing.image} alt={managing.name} className="w-full aspect-[16/9] object-cover rounded-xl" />
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium">Available for booking</p>
                  <p className="text-xs text-muted-foreground">Toggle off to mark as occupied</p>
                </div>
                <Switch
                  checked={managing.available}
                  onCheckedChange={() => {
                    toggleRoomAvailability(managing.id);
                    setManaging({ ...managing, available: !managing.available });
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price per night ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={managing.price}
                  onChange={(e) => setManaging({ ...managing, price: Number(e.target.value) })}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Amenities: {managing.amenities.join(", ")}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setManaging(null)}>Close</Button>
              <Button
                className="gradient-primary text-primary-foreground"
                onClick={() => {
                  updateRoom(managing.id, { price: managing.price });
                  toast.success("Pricing updated");
                  setManaging(null);
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </DashboardLayout>
  );
}

function RoomFormDialog({
  title,
  initial,
  onCancel,
  onSubmit,
}: {
  title: string;
  initial: FormState;
  onCancel: () => void;
  onSubmit: (f: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(initial);

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const valid = form.name.trim().length > 0 && form.price > 0;

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Configure the room details below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Room name</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Deluxe Ocean View" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROOM_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price / night ($)</Label>
              <Input id="price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Amenities</Label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_AMENITIES.map((a) => {
                const on = form.amenities.includes(a);
                return (
                  <button
                    type="button"
                    key={a}
                    onClick={() => toggleAmenity(a)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-md border transition ${
                      on
                        ? "gradient-primary text-primary-foreground border-transparent"
                        : "bg-background text-foreground border-border hover:bg-accent"
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="img">Image</Label>
            <Input id="img" type="file" accept="image/*" onChange={onFile} />
            {form.image && (
              <img src={form.image} alt="Preview" className="w-full aspect-[16/9] object-cover rounded-xl border border-border" />
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border p-3">
            <Label htmlFor="avail" className="cursor-pointer">Available for booking</Label>
            <Switch id="avail" checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="gradient-primary text-primary-foreground" disabled={!valid} onClick={() => onSubmit(form)}>
            Save room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
