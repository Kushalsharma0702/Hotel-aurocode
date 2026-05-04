import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { packageInventoryApi } from "@/lib/api";
import { DashboardLayout } from "@/components/dashboard/Layout";
import { toast } from "sonner";
import { Package, MapPin, Clock, Plus, Trash2, Edit3, X, Save, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/package-catalog")({ component: PackageCatalogPage });

type PackageTemplate = {
  id: string; title: string; destination: string; image: string; images: string[];
  duration: string; price: number; originalPrice: number | null;
  rating: number; reviews: number; inclusions: string[]; exclusions: string[];
  itinerary: any[]; badges: string[]; category: string; description: string;
  highlights: string[]; addOns: any[]; policies: any;
};

function PackageCatalogPage() {
  const [packages, setPackages] = useState<PackageTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<Partial<PackageTemplate> | null>(null);

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await packageInventoryApi.list();
      setPackages(res);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => { fetchPackages(); }, [fetchPackages]);

  const openNewModal = () => {
    setEditingPkg({
      title: "", destination: "", image: "", images: [], duration: "",
      price: 0, originalPrice: null, category: "", description: "",
      inclusions: [], exclusions: [], itinerary: [], highlights: [], addOns: [], policies: {}
    });
    setIsModalOpen(true);
  };

  const openEditModal = (pkg: PackageTemplate) => {
    setEditingPkg({ ...pkg });
    setIsModalOpen(true);
  };

  const deletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package template?")) return;
    try {
      await packageInventoryApi.delete(id);
      toast.success("Package deleted successfully");
      fetchPackages();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPkg) return;
    try {
      if (editingPkg.id) {
        await packageInventoryApi.update(editingPkg.id, editingPkg);
        toast.success("Package updated successfully");
      } else {
        await packageInventoryApi.create(editingPkg);
        toast.success("Package created successfully");
      }
      setIsModalOpen(false);
      fetchPackages();
    } catch (e: any) { toast.error(e.message); }
  };

  const inp = "w-full px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm focus:ring-2 focus:ring-blue-200 focus:outline-none";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Package Catalog</h1>
            <p className="text-muted-foreground text-sm">Manage the holiday packages available on the Client-CRM</p>
          </div>
          <button onClick={openNewModal} className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-primary-foreground shadow-glow text-sm font-medium">
            <Plus className="w-4 h-4" /> Create Package
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading...</div>
        ) : packages.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
            <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-bold mb-1">No packages available</h3>
            <p className="text-sm text-muted-foreground">Create a new package to display it on the customer portal.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
                <div className="h-48 relative bg-muted">
                  {pkg.image ? (
                    <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8 opacity-20" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow-sm">
                    ${pkg.price.toLocaleString()}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold mb-1">{pkg.title}</h3>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mb-4">
                    <MapPin className="w-3 h-3" /> {pkg.destination}
                    <span>•</span> <Clock className="w-3 h-3" /> {pkg.duration}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {pkg.description}
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-border/50">
                    <button onClick={() => openEditModal(pkg)} className="flex-1 flex justify-center items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 hover:bg-muted text-sm font-medium transition-colors">
                      <Edit3 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => deletePackage(pkg.id)} className="flex items-center justify-center w-10 h-10 rounded-xl bg-destructive/5 hover:bg-destructive/10 text-destructive transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && editingPkg && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-background rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
              <div className="flex justify-between items-center p-6 border-b border-border/50">
                <h2 className="text-xl font-bold">{editingPkg.id ? "Edit Package" : "Create Package"}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <form id="package-form" onSubmit={handleSave} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Title</label>
                      <input required value={editingPkg.title || ""} onChange={e => setEditingPkg({...editingPkg, title: e.target.value})} className={inp} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Destination</label>
                      <input required value={editingPkg.destination || ""} onChange={e => setEditingPkg({...editingPkg, destination: e.target.value})} className={inp} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Duration</label>
                      <input required value={editingPkg.duration || ""} onChange={e => setEditingPkg({...editingPkg, duration: e.target.value})} placeholder="e.g. 5N/6D" className={inp} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Price</label>
                      <input required type="number" value={editingPkg.price || ""} onChange={e => setEditingPkg({...editingPkg, price: Number(e.target.value)})} className={inp} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Category</label>
                      <input required value={editingPkg.category || ""} onChange={e => setEditingPkg({...editingPkg, category: e.target.value})} placeholder="Family, Adventure, etc." className={inp} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Image URL</label>
                      <input required value={editingPkg.image || ""} onChange={e => setEditingPkg({...editingPkg, image: e.target.value})} placeholder="https://..." className={inp} />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</label>
                      <textarea required value={editingPkg.description || ""} onChange={e => setEditingPkg({...editingPkg, description: e.target.value})} className={`${inp} min-h-[100px]`} />
                    </div>
                  </div>
                  {/* Note: In a real app, you'd add array inputs for inclusions, itinerary, add-ons here */}
                  <p className="text-xs text-muted-foreground mt-2 italic">Note: Advanced features like itinerary and add-ons can be managed via the API for now.</p>
                </form>
              </div>
              
              <div className="p-6 border-t border-border/50 flex justify-end gap-3 bg-muted/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button type="submit" form="package-form" className="px-5 py-2.5 rounded-xl gradient-primary text-primary-foreground text-sm font-medium shadow-glow flex items-center gap-2 transition-all hover:opacity-90">
                  <Save className="w-4 h-4" /> Save Package
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
