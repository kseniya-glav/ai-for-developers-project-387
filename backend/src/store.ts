import { randomUUID } from "node:crypto";

export interface Owner {
  id: string;
  name: string;
  email: string;
}

export interface EventType {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
}

export interface Slot {
  startTime: string;
  endTime: string;
  eventTypeId: string;
}

export type BookingStatus = "confirmed";

export interface Booking {
  id: string;
  eventTypeId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  guestName: string;
  guestEmail: string;
  createdAt: string;
}

// ── In-memory store ──────────────────────────────────────────────────────

const owner: Owner = {
  id: process.env.OWNER_ID || "owner-1",
  name: process.env.OWNER_NAME || "Алексей Иванов",
  email: process.env.OWNER_EMAIL || "alexey@example.com",
};

const eventTypes = new Map<string, EventType>();
const bookings: Booking[] = [];
const reservedKeys = new Set<string>();

export function getOwner(): Owner {
  return owner;
}

export function createEventType(data: {
  title: string;
  description: string;
  durationMinutes: number;
}): EventType {
  const et: EventType = { id: randomUUID(), ...data };
  eventTypes.set(et.id, et);
  return et;
}

export function listEventTypes(): EventType[] {
  return [...eventTypes.values()];
}

export function getEventType(id: string): EventType | undefined {
  return eventTypes.get(id);
}

export function createBooking(data: {
  eventTypeId: string;
  startTime: string;
  guestName: string;
  guestEmail: string;
}): Booking | "NOT_FOUND" | "CONFLICT" {
  const et = eventTypes.get(data.eventTypeId);
  if (!et) return "NOT_FOUND";

  const start = new Date(data.startTime);
  const end = new Date(start.getTime() + et.durationMinutes * 60_000);
  const startISO = start.toISOString();
  const endISO = end.toISOString();

  const key = startISO;
  if (reservedKeys.has(key)) return "CONFLICT";

  for (const b of bookings) {
    if (overlaps(startISO, endISO, b.startTime, b.endTime)) {
      return "CONFLICT";
    }
  }

  reservedKeys.add(key);

  const booking: Booking = {
    id: randomUUID(),
    eventTypeId: data.eventTypeId,
    startTime: startISO,
    endTime: endISO,
    status: "confirmed",
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  return booking;
}

export function listBookings(): Booking[] {
  return [...bookings].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
}

export function getAllBookings(): Booking[] {
  return bookings;
}

export function resetStore(): void {
  eventTypes.clear();
  bookings.length = 0;
  reservedKeys.clear();
}

function overlaps(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  return start1 < end2 && start2 < end1;
}
