export interface User {
  name: string;
  email: string;
  phone: string;
  password?: string;
}

export interface Session {
  email: string;
}

export interface Passenger {
  name: string;
  age: number;
  gender: string;
}

export interface Booking {
  pnr: string;
  userEmail: string;
  busId: string;
  busName: string;
  busType: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  arrivalTime: string;
  boardingPoint: string;
  seats: string[];
  passengers: Passenger[];
  contactEmail: string;
  contactPhone: string;
  baseFare: number;
  gst: number;
  totalFare: number;
  createdAt: string;
  status: "CONFIRMED" | "CANCELLED";
}

const USERS_KEY = "jat_users";
const SESSION_KEY = "jat_session";
const BOOKINGS_KEY = "jat_bookings";

export function initStorage() {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    localStorage.setItem(
      USERS_KEY,
      JSON.stringify([
        {
          name: "Demo User",
          email: "demo@jayambetravels.in",
          phone: "9876543210",
          password: "demo123",
        },
      ])
    );
  }
}

export function getSession(): Session | null {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

export async function login(email: string, password?: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) throw new Error("Invalid credentials");
  
  const session = { email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { user, session };
}

export async function register(user: User) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  if (users.find((u) => u.email === user.email)) {
    throw new Error("Email already registered");
  }
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  const session = { email: user.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { user, session };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function generatePNR() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "JAT-";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createBooking(bookingData: Omit<Booking, "pnr" | "createdAt" | "status">) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const bookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
  const pnr = generatePNR();
  const newBooking: Booking = {
    ...bookingData,
    pnr,
    createdAt: new Date().toISOString(),
    status: "CONFIRMED",
  };
  bookings.push(newBooking);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  return newBooking;
}

export async function getUserBookings(email: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const bookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
  return bookings.filter((b) => b.userEmail === email).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getBookingByPnr(pnr: string) {
  await new Promise((resolve) => setTimeout(resolve, 300));
  const bookings: Booking[] = JSON.parse(localStorage.getItem(BOOKINGS_KEY) || "[]");
  return bookings.find((b) => b.pnr === pnr) || null;
}
