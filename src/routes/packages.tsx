import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { packagesApi } from "@/lib/api";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { toast } from "sonner";
import {
  Package, MapPin, Calendar, Users, Clock, ChevronDown, ChevronUp,
  Edit3, Trash2, Save, X, Plus, Eye, Search, Filter,
} from "lucide-react";

export const Route = createFileRoute("/packages")({ component: PackagesPage });

type PkgBooking = {
  id: string; package_title: string; package_destination: string;
  package_duration: string; package_category: string | null;
  guest_name: string; guest_email: string | null; guest_phone: string | null;
  travelers_count: number; travelers: any[]; itinerary: any[];
  inclusions: string[]; exclusions: string[]; add_ons: any[];
  travel_date: string | null; status: string; payment_status: string;
  amount: number; staff_notes: string | null; assigned_to: string | null;
  created_at: string | null;
};

type Stats = { total_bookings: number; total_revenue: number; confirmed: number; pending: number };

function PackagesPage() {
  const [bookings, setBookings] = useState<PkgBooking[]>([]);
  const [stats, setStats] = useState<Stats>({ total_bookings: 0, total_revenue: 0, confirmed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<PkgBooking>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, sRes] = await Promise.all([packagesApi.list(statusFilter || undefined), packagesApi.stats()]);
      setBookings(bRes.bookings || []);
      setStats(sRes);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = bookings.filter(b =>
    !searchTerm || b.package_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.guest_name.toLowerCase().includes(searchTerm.toLowerCase()) || b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEdit = (b: PkgBooking) => {
    setEditingId(b.id);
    setEditData({ status: b.status, payment_status: b.payment_status, staff_notes: b.staff_notes || "",
      assigned_to: b.assigned_to || "", itinerary: JSON.parse(JSON.stringify(b.itinerary || [])) });
    setExpandedId(b.id);
  };

  const saveEdit = async (id: string) => {
    try {
      await packagesApi.update(id, editData);
      toast.success("Package booking updated");
      setEditingId(null); fetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this package booking?")) return;
    try { await packagesApi.delete(id); toast.success("Deleted"); fetchAll(); }
    catch (e: any) { toast.error(e.message); }
  };

  const updateItineraryDay = (dayIdx: number, field: string, value: any) => {
    const itin = [...(editData.itinerary || [])];
    itin[dayIdx] = { ...itin[dayIdx], [field]: value };
    setEditData({ ...editData, itinerary: itin });
  };

  const updateActivity = (dayIdx: number, actIdx: number, value: string) => {
    const itin = [...(editData.itinerary || [])];
    const acts = [...(itin[dayIdx].activities || [])];
    acts[actIdx] = value;
    itin[dayIdx] = { ...itin[dayIdx], activities: acts };
    setEditData({ ...editData, itinerary: itin });
  };

  const addActivity = (dayIdx: number) => {
    const itin = [...(editData.itinerary || [])];
    itin[dayIdx] = { ...itin[dayIdx], activities: [...(itin[dayIdx].activities || []), ""] };
    setEditData({ ...editData, itinerary: itin });
  };

  const removeActivity = (dayIdx: number, actIdx: number) => {
    const itin = [...(editData.itinerary || [])];
    itin[dayIdx] = { ...itin[dayIdx], activities: itin[dayIdx].activities.filter((_: any, i: number) => i !== actIdx) };
    setEditData({ ...editData, itinerary: itin });
  };

  const addDay = () => {
    const itin = [...(editData.itinerary || [])];
    itin.push({ day: itin.length + 1, title: "New Day", activities: [""] });
    setEditData({ ...editData, itinerary: itin });
  };

  const removeDay = (dayIdx: number) => {
    const itin = (editData.itinerary || []).filter((_: any, i: number) => i !== dayIdx)
      .map((d: any, i: number) => ({ ...d, day: i + 1 }));
    setEditData({ ...editData, itinerary: itin });
  };

  const statusColor = (s: string) => s === "Confirmed" ? "bg-emerald-100 text-emerald-700" : s === "Pending" ? "bg-amber-100 text-amber-700" : s === "Cancelled" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700";
  const payColor = (s: string) => s === "Paid" ? "text-emerald-600" : s === "Refunded" ? "text-red-500" : "text-amber-600";
  const inp = "w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Packages</h1>
          <p className="text-muted-foreground text-sm">Manage package bookings, edit itineraries, and track travelers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: stats.total_bookings, color: "bg-blue-50 border-blue-200" },
            { label: "Revenue", value: `$${(stats.total_revenue / 1000).toFixed(0)}K`, color: "bg-emerald-50 border-emerald-200" },
            { label: "Confirmed", value: stats.confirmed, color: "bg-green-50 border-green-200" },
            { label: "Pending", value: stats.pending, color: "bg-amber-50 border-amber-200" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl border p-5 ${s.color}`}>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm" placeholder="Search package, guest or ID..." />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-border bg-card text-sm">
            <option value="">All statuses</option>
            <option>Confirmed</option><option>Pending</option><option>Cancelled</option><option>Completed</option>
          </select>
        </div>

        {/* Bookings list */}
        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-bold mb-1">No package bookings yet</h3>
            <p className="text-sm text-muted-foreground">Package bookings from the client app will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(b => {
              const isExpanded = expandedId === b.id;
              const isEditing = editingId === b.id;
              return (
                <div key={b.id} className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                  {/* Row */}
                  <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : b.id)}>
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{b.package_title}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <MapPin className="w-3 h-3" /> {b.package_destination}
                        <span>•</span> <Clock className="w-3 h-3" /> {b.package_duration}
                      </div>
                    </div>
                    <div className="hidden sm:block text-sm">
                      <div className="font-medium">{b.guest_name}</div>
                      <div className="text-xs text-muted-foreground">{b.guest_email}</div>
                    </div>
                    <div className="hidden md:flex items-center gap-2 text-xs">
                      <Users className="w-3 h-3" /> {b.travelers_count}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">${b.amount.toLocaleString()}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(b.status)}`}>{b.status}</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      <button onClick={e => { e.stopPropagation(); startEdit(b); }} className="p-1.5 rounded-lg hover:bg-muted"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={e => { e.stopPropagation(); deleteBooking(b.id); }} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border/50 p-5 space-y-5 bg-muted/30">
                      {/* Status + Notes row */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
                          {isEditing ? (
                            <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })} className={inp}>
                              <option>Confirmed</option><option>Pending</option><option>Cancelled</option><option>Completed</option>
                            </select>
                          ) : <span className={`text-xs px-2 py-1 rounded-full ${statusColor(b.status)}`}>{b.status}</span>}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Payment</label>
                          {isEditing ? (
                            <select value={editData.payment_status} onChange={e => setEditData({ ...editData, payment_status: e.target.value })} className={inp}>
                              <option>Paid</option><option>Pending</option><option>Refunded</option>
                            </select>
                          ) : <span className={`text-xs font-medium ${payColor(b.payment_status)}`}>{b.payment_status}</span>}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground block mb-1">Assigned To</label>
                          {isEditing ? (
                            <input value={editData.assigned_to || ""} onChange={e => setEditData({ ...editData, assigned_to: e.target.value })} className={inp} placeholder="Staff name" />
                          ) : <span className="text-sm">{b.assigned_to || "—"}</span>}
                        </div>
                      </div>

                      {/* Staff Notes */}
                      <div>
                        <label className="text-xs font-medium text-muted-foreground block mb-1">Staff Notes</label>
                        {isEditing ? (
                          <textarea value={editData.staff_notes || ""} onChange={e => setEditData({ ...editData, staff_notes: e.target.value })}
                            className={`${inp} min-h-[60px]`} placeholder="Internal notes..." />
                        ) : <p className="text-sm text-muted-foreground">{b.staff_notes || "No notes"}</p>}
                      </div>

                      {/* Travelers */}
                      {b.travelers && b.travelers.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Travelers ({b.travelers_count})</h4>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {b.travelers.map((t: any, i: number) => (
                              <div key={i} className="bg-white rounded-lg border border-border/50 p-3 text-sm">
                                <div className="font-medium">{t.name || `Traveler ${i + 1}`}</div>
                                <div className="text-xs text-muted-foreground">{t.email} {t.phone && `• ${t.phone}`}</div>
                                {t.gender && <div className="text-xs text-muted-foreground">{t.gender}{t.age ? `, ${t.age} yrs` : ""}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Inclusions / Add-ons */}
                      <div className="grid md:grid-cols-2 gap-4">
                        {b.inclusions.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Inclusions</h4>
                            <div className="flex flex-wrap gap-1">{b.inclusions.map(inc => <span key={inc} className="text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{inc}</span>)}</div>
                          </div>
                        )}
                        {b.add_ons && b.add_ons.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Add-ons</h4>
                            <div className="flex flex-wrap gap-1">{b.add_ons.map((ao: any, i: number) => <span key={i} className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">{ao.name} (+${ao.price})</span>)}</div>
                          </div>
                        )}
                      </div>

                      {/* Itinerary */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Itinerary</h4>
                          {isEditing && <button onClick={addDay} className="text-xs text-primary font-medium flex items-center gap-1"><Plus className="w-3 h-3" /> Add Day</button>}
                        </div>
                        {(isEditing ? editData.itinerary : b.itinerary)?.length ? (
                          <div className="space-y-2">
                            {(isEditing ? editData.itinerary! : b.itinerary).map((day: any, di: number) => (
                              <div key={di} className="bg-white rounded-xl border border-border/50 p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="w-7 h-7 rounded-full gradient-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{day.day}</span>
                                  {isEditing ? (
                                    <input value={day.title} onChange={e => updateItineraryDay(di, "title", e.target.value)} className={`${inp} flex-1`} />
                                  ) : (
                                    <span className="font-semibold text-sm">{day.title}</span>
                                  )}
                                  {isEditing && <button onClick={() => removeDay(di)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="w-3 h-3" /></button>}
                                </div>
                                <div className="pl-9 space-y-1">
                                  {(day.activities || []).map((act: string, ai: number) => (
                                    <div key={ai} className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                      {isEditing ? (
                                        <>
                                          <input value={act} onChange={e => updateActivity(di, ai, e.target.value)} className={`${inp} flex-1 py-1.5 text-xs`} />
                                          <button onClick={() => removeActivity(di, ai)} className="text-destructive"><X className="w-3 h-3" /></button>
                                        </>
                                      ) : <span className="text-xs text-muted-foreground">{act}</span>}
                                    </div>
                                  ))}
                                  {isEditing && <button onClick={() => addActivity(di)} className="text-xs text-primary/70 hover:text-primary ml-3">+ Add activity</button>}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : <p className="text-sm text-muted-foreground">No itinerary set</p>}
                      </div>

                      {/* Action buttons */}
                      {isEditing ? (
                        <div className="flex gap-2 pt-2">
                          <button onClick={() => saveEdit(b.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-glow">
                            <Save className="w-4 h-4" /> Save Changes
                          </button>
                          <button onClick={() => setEditingId(null)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted">
                            <X className="w-4 h-4" /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-2 sm:hidden">
                          <button onClick={() => startEdit(b)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium"><Edit3 className="w-4 h-4" /> Edit</button>
                          <button onClick={() => deleteBooking(b.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-destructive text-destructive text-sm font-medium"><Trash2 className="w-4 h-4" /> Delete</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
