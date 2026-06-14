import { useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api";
import type { Booking, EventType } from "@/types/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { CalendarCheck } from "lucide-react";

export function BookingsPage() {
  const { data: bookings, loading, error } = useApi(
    useCallback(() => api.listBookings(), [])
  );
  const { data: eventTypes } = useApi(
    useCallback(() => api.listEventTypes(), [])
  );

  const etMap = new Map(eventTypes?.map((et: EventType) => [et.id, et]));

  if (loading) return <p className="text-muted-foreground">Загрузка…</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Бронирования</h1>

      {!bookings?.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Пока нет бронирований
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((b: Booking) => {
            const et = etMap.get(b.eventTypeId);
            return (
              <Card key={b.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {et?.title ?? "Тип события"}
                    </CardTitle>
                    <Badge variant="secondary">{b.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarCheck className="h-4 w-4" />
                      {format(parseISO(b.startTime), "d MMMM yyyy, HH:mm", {
                        locale: ru,
                      })}{" "}
                      — {format(parseISO(b.endTime), "HH:mm")}
                    </span>
                    <span>{b.guestName}</span>
                    <span>{b.guestEmail}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
