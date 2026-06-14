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

export interface EventTypeCreate {
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

export interface BookingCreate {
  eventTypeId: string;
  startTime: string;
  guestName: string;
  guestEmail: string;
}

export interface ApiError {
  code: "NOT_FOUND" | "CONFLICT" | "BAD_REQUEST";
  message: string;
}
