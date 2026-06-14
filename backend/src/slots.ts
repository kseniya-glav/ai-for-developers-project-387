import type { EventType, Slot, Booking } from "./store.js";

const WORKING_START = 9; // 09:00
const WORKING_END = 18; // 18:00
const BOOKING_WINDOW_DAYS = 14;

export function generateSlots(
  eventType: EventType,
  startDate: string | undefined,
  existingBookings: Booking[]
): Slot[] {
  const start = startDate
    ? new Date(startDate)
    : new Date();

  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate()
  );

  const endDay = new Date(startDay);
  endDay.setDate(endDay.getDate() + BOOKING_WINDOW_DAYS);

  const slots: Slot[] = [];
  const durationMs = eventType.durationMinutes * 60_000;

  const now = new Date();

  const current = new Date(startDay);
  while (current < endDay) {
    for (let hour = WORKING_START; hour < WORKING_END; hour++) {
      const slotStart = new Date(current);
      slotStart.setHours(hour, 0, 0, 0);

      if (slotStart <= now) continue;

      const slotEnd = new Date(slotStart.getTime() + durationMs);

      if (slotEnd.getHours() > WORKING_END ||
          (slotEnd.getHours() === WORKING_END && slotEnd.getMinutes() > 0)) {
        continue;
      }

      const slotStartISO = slotStart.toISOString();
      const slotEndISO = slotEnd.toISOString();

      const isBooked = existingBookings.some(
        (b) => slotStartISO < b.endTime && b.startTime < slotEndISO
      );

      if (!isBooked) {
        slots.push({
          startTime: slotStartISO,
          endTime: slotEndISO,
          eventTypeId: eventType.id,
        });
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return slots;
}
