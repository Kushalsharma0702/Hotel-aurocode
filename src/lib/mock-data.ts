import roomDeluxe from "@/assets/room-deluxe.jpg";
import roomSuite from "@/assets/room-suite.jpg";
import roomStandard from "@/assets/room-standard.jpg";
import roomPresidential from "@/assets/room-presidential.jpg";

export type BookingStatus = "Confirmed" | "Pending" | "Cancelled";
export type PaymentStatus = "Paid" | "Pending" | "Refunded";

export const bookings = [
  { id: "BK-1042", guest: "Emma Thompson", room: "Deluxe Ocean", checkIn: "2026-05-02", checkOut: "2026-05-06", status: "Confirmed" as BookingStatus, payment: "Paid" as PaymentStatus, amount: 1240 },
  { id: "BK-1041", guest: "Liam Carter",  room: "Presidential", checkIn: "2026-05-03", checkOut: "2026-05-08", status: "Confirmed" as BookingStatus, payment: "Paid" as PaymentStatus, amount: 4250 },
  { id: "BK-1040", guest: "Sofia Rossi",  room: "Suite Marble", checkIn: "2026-05-04", checkOut: "2026-05-07", status: "Pending"   as BookingStatus, payment: "Pending" as PaymentStatus, amount: 1890 },
  { id: "BK-1039", guest: "Noah Patel",   room: "Standard",     checkIn: "2026-05-01", checkOut: "2026-05-03", status: "Cancelled" as BookingStatus, payment: "Refunded" as PaymentStatus, amount: 320 },
  { id: "BK-1038", guest: "Ava Nguyen",   room: "Deluxe Ocean", checkIn: "2026-05-05", checkOut: "2026-05-09", status: "Confirmed" as BookingStatus, payment: "Paid" as PaymentStatus, amount: 1520 },
  { id: "BK-1037", guest: "Mason Brooks", room: "Suite Marble", checkIn: "2026-05-06", checkOut: "2026-05-10", status: "Confirmed" as BookingStatus, payment: "Paid" as PaymentStatus, amount: 2100 },
  { id: "BK-1036", guest: "Isabella Cruz",room: "Standard",     checkIn: "2026-05-02", checkOut: "2026-05-04", status: "Pending"   as BookingStatus, payment: "Pending" as PaymentStatus, amount: 280 },
];

export const rooms = [
  { id: 1, name: "Deluxe Ocean View", type: "Deluxe",      price: 310, available: true,  amenities: ["WiFi", "AC", "Pool", "Breakfast"], image: roomDeluxe },
  { id: 2, name: "Marble Executive Suite", type: "Suite",  price: 540, available: true,  amenities: ["WiFi", "AC", "Lounge", "Spa"],     image: roomSuite },
  { id: 3, name: "Cozy Standard",     type: "Standard",    price: 140, available: false, amenities: ["WiFi", "AC"],                       image: roomStandard },
  { id: 4, name: "Presidential Skyline", type: "Presidential", price: 1290, available: true, amenities: ["WiFi", "AC", "Butler", "Pool", "Spa"], image: roomPresidential },
];

export const customers = [
  { id: 1, name: "Emma Thompson", email: "emma@hello.com",   phone: "+1 415 555 0142", bookings: 8, lastStay: "Apr 22, 2026", vip: true  },
  { id: 2, name: "Liam Carter",   email: "liam@nova.io",     phone: "+44 20 7946 0958",bookings: 3, lastStay: "Mar 11, 2026", vip: true  },
  { id: 3, name: "Sofia Rossi",   email: "sofia@rossi.it",   phone: "+39 06 9870 5544",bookings: 5, lastStay: "Feb 04, 2026", vip: false },
  { id: 4, name: "Noah Patel",    email: "noah@patel.dev",   phone: "+91 22 4040 0188",bookings: 2, lastStay: "Jan 18, 2026", vip: false },
  { id: 5, name: "Ava Nguyen",    email: "ava@avalux.co",    phone: "+1 212 555 0901", bookings: 11,lastStay: "Apr 28, 2026", vip: true  },
  { id: 6, name: "Mason Brooks",  email: "mason@brooks.us",  phone: "+1 305 555 7733", bookings: 4, lastStay: "Mar 30, 2026", vip: false },
];

export const payments = [
  { id: "TX-90212", guest: "Emma Thompson", date: "2026-04-29", amount: 1240, method: "Visa ••4421", status: "Paid"     },
  { id: "TX-90211", guest: "Liam Carter",   date: "2026-04-28", amount: 4250, method: "Amex ••1009", status: "Paid"     },
  { id: "TX-90210", guest: "Sofia Rossi",   date: "2026-04-27", amount: 1890, method: "Mastercard ••8821", status: "Pending"  },
  { id: "TX-90209", guest: "Noah Patel",    date: "2026-04-26", amount: 320,  method: "PayPal",     status: "Refunded" },
  { id: "TX-90208", guest: "Ava Nguyen",    date: "2026-04-25", amount: 1520, method: "Visa ••0033", status: "Paid"     },
];

export const revenueByMonth = [
  { month: "Nov", revenue: 42000, bookings: 142 },
  { month: "Dec", revenue: 58000, bookings: 198 },
  { month: "Jan", revenue: 39000, bookings: 121 },
  { month: "Feb", revenue: 47000, bookings: 156 },
  { month: "Mar", revenue: 61000, bookings: 211 },
  { month: "Apr", revenue: 72000, bookings: 248 },
];

export const occupancyByDay = [
  { day: "Mon", rate: 68 },
  { day: "Tue", rate: 72 },
  { day: "Wed", rate: 80 },
  { day: "Thu", rate: 78 },
  { day: "Fri", rate: 92 },
  { day: "Sat", rate: 96 },
  { day: "Sun", rate: 88 },
];

export const tickets = [
  { id: "T-204", guest: "Emma Thompson", subject: "Late check-in request",   preview: "Hi, my flight lands at 11pm — could you keep my room…", status: "Open",     time: "5m" },
  { id: "T-203", guest: "Liam Carter",   subject: "Spa appointment for two", preview: "Could you arrange a couple's massage on Saturday?",   status: "Pending",  time: "1h" },
  { id: "T-202", guest: "Sofia Rossi",   subject: "Allergy notice",          preview: "Please make sure pillows in my suite are hypoallergenic.", status: "Resolved", time: "3h" },
  { id: "T-201", guest: "Ava Nguyen",    subject: "Airport pickup",          preview: "Need a car for 4 from JFK on the 5th, evening flight.", status: "Open",     time: "1d" },
];

export const aiInsights = [
  { kind: "pricing",   title: "Increase weekend pricing by 12%", detail: "Demand for Deluxe & Suite rooms is 23% above forecast for the next 3 weekends.", impact: "+$8.4k est." },
  { kind: "demand",    title: "High demand for Deluxe rooms",     detail: "Search interest +41% week-over-week. Consider promoting upgrade packages.",       impact: "Trending"     },
  { kind: "occupancy", title: "Low occupancy May 13–18",          detail: "Mid-week dip detected. Offer a 15% off ‘Stay 3 Pay 2’ promo to fill rooms.",      impact: "-22% nights"  },
  { kind: "loyalty",   title: "Re-engage 124 dormant VIPs",        detail: "Top-tier guests haven't booked in 90+ days. Send a personalized return offer.",  impact: "+$14k LTV"    },
];
