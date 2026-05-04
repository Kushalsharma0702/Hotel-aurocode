import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { roomsApi, bookingsApi, customersApi, statsApi } from "./api";

export type BookingStatus = "Confirmed" | "Pending" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending" | "Refunded";

export type Room = {
  id: number;
  name: string;
  type: string;
  price: number;
  available: boolean;
  amenities: string[];
  image: string;
  image_url?: string | null;
  capacity?: number;
};

export type Booking = {
  id: string;
  guest: string;
  guest_email?: string;
  room: string;
  room_id?: number;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  payment: PaymentStatus;
  amount: number;
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  bookings: number;
  lastStay: string;
  vip: boolean;
};

type DashboardStats = {
  total_bookings: number;
  total_revenue: number;
  occupancy_rate: number;
  available_rooms: number;
  total_rooms: number;
};

type Ctx = {
  bookings: Booking[];
  rooms: Room[];
  customers: Customer[];
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateBooking: (id: string, patch: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;
  addRoom: (r: Omit<Room, "id">) => Promise<void>;
  updateRoom: (id: number, patch: Partial<Room>) => Promise<void>;
  toggleRoomAvailability: (id: number) => Promise<void>;
  addCustomer: (c: Pick<Customer, "name" | "email" | "phone">) => Promise<void>;
};

const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 10'><rect width='16' height='10' fill='%23dbeafe'/><text x='8' y='6' font-size='1.2' text-anchor='middle' fill='%231e40af'>Room</text></svg>";

const CrmContext = createContext<Ctx | null>(null);

export function CrmProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [roomsRes, bookingsRes, customersRes, statsRes] = await Promise.all([
        roomsApi.list(),
        bookingsApi.list(),
        customersApi.list(),
        statsApi.dashboard(),
      ]);
      setRooms(
        (roomsRes.rooms || []).map((r: any) => ({
          ...r,
          image: r.image_url || PLACEHOLDER_IMG,
        }))
      );
      setBookings(bookingsRes.bookings || []);
      setCustomers(customersRes.customers || []);
      setStats(statsRes);
    } catch (err: any) {
      console.error("Failed to fetch CRM data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const updateBooking = useCallback(async (id: string, patch: Partial<Booking>) => {
    const apiPatch: any = {};
    if (patch.status) apiPatch.status = patch.status;
    if (patch.payment) apiPatch.payment_status = patch.payment;
    if (patch.amount !== undefined) apiPatch.amount = patch.amount;
    await bookingsApi.update(id, apiPatch);
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }, []);

  const deleteBooking = useCallback(async (id: string) => {
    await bookingsApi.delete(id);
    setBookings((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const addRoom = useCallback(async (r: Omit<Room, "id">) => {
    const created = await roomsApi.create({
      name: r.name,
      type: r.type,
      price: r.price,
      available: r.available,
      amenities: r.amenities,
      image_url: r.image_url || r.image || null,
    });
    setRooms((prev) => [...prev, { ...created, image: created.image_url || PLACEHOLDER_IMG }]);
  }, []);

  const updateRoom = useCallback(async (id: number, patch: Partial<Room>) => {
    const apiPatch: any = { ...patch };
    if (patch.image) {
      apiPatch.image_url = patch.image;
      delete apiPatch.image;
    }
    const updated = await roomsApi.update(id, apiPatch);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === id ? { ...updated, image: updated.image_url || PLACEHOLDER_IMG } : r
      )
    );
  }, []);

  const toggleRoomAvailability = useCallback(async (id: number) => {
    const updated = await roomsApi.toggleAvailability(id);
    setRooms((prev) =>
      prev.map((r) =>
        r.id === id ? { ...updated, image: updated.image_url || PLACEHOLDER_IMG } : r
      )
    );
  }, []);

  const addCustomer = useCallback(async (c: Pick<Customer, "name" | "email" | "phone">) => {
    const created = await customersApi.create(c);
    setCustomers((prev) => [...prev, created]);
  }, []);

  return (
    <CrmContext.Provider
      value={{
        bookings,
        rooms,
        customers,
        stats,
        loading,
        error,
        refresh: fetchAll,
        updateBooking,
        deleteBooking,
        addRoom,
        updateRoom,
        toggleRoomAvailability,
        addCustomer,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const ctx = useContext(CrmContext);
  if (!ctx) throw new Error("useCrm must be used inside CrmProvider");
  return ctx;
}
