import type {
  Owner,
  EventType,
  EventTypeCreate,
  Slot,
  Booking,
  BookingCreate,
  ApiError,
} from "@/types/api";

const BASE_URL = "/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      code: "BAD_REQUEST",
      message: res.statusText,
    }));
    throw err;
  }

  return res.json();
}

export const api = {
  getOwner: () => request<Owner>("/owner"),

  createEventType: (data: EventTypeCreate) =>
    request<EventType>("/event-types", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listEventTypes: () => request<EventType[]>("/event-types"),

  getSlots: (eventTypeId: string, startDate?: string) => {
    const params = startDate ? `?startDate=${startDate}` : "";
    return request<Slot[]>(`/event-types/${eventTypeId}/slots${params}`);
  },

  createBooking: (data: BookingCreate) =>
    request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  listBookings: () => request<Booking[]>("/bookings"),
};
