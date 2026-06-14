import { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api";
import type { EventType, Slot } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { BookingDialog } from "@/components/BookingDialog";

interface Props {
  eventType: EventType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SlotsDialog({ eventType, open, onOpenChange }: Props) {
  const [startDate, setStartDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const { data: slots, loading, error, refetch } = useApi(
    useCallback(
      () => api.getSlots(eventType.id, startDate || undefined),
      [eventType.id, startDate]
    )
  );

  const groupByDate = (slotList: Slot[]) => {
    const groups: Record<string, Slot[]> = {};
    for (const s of slotList) {
      const day = s.startTime.slice(0, 10);
      (groups[day] ??= []).push(s);
    }
    return groups;
  };

  const handleSlotSelect = (slot: Slot) => {
    setSelectedSlot(slot);
  };

  return (
    <>
      <Dialog open={open && !selectedSlot} onOpenChange={(v) => { if (!v) onOpenChange(false); }}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{eventType.title} — свободные слоты</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="startDate">Начальная дата (необязательно)</Label>
            <div className="flex gap-2">
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setStartDate(e.target.value)
                }
              />
              <Button variant="outline" size="sm" onClick={refetch}>
                Обновить
              </Button>
            </div>
          </div>

          <Separator />

          {loading && <p className="text-muted-foreground">Загрузка…</p>}
          {error && <p className="text-destructive">{error}</p>}

          {!loading && !error && (
            <>
              {slots && slots.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(groupByDate(slots)).map(([day, daySlots]) => (
                    <div key={day}>
                      <p className="mb-2 text-sm font-medium capitalize text-muted-foreground">
                        {format(parseISO(day), "EEEE, d MMMM", { locale: ru })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map((slot) => (
                          <Badge
                            key={slot.startTime}
                            variant="outline"
                            className="cursor-pointer px-3 py-1.5 text-sm"
                            onClick={() => handleSlotSelect(slot)}
                          >
                            {format(parseISO(slot.startTime), "HH:mm")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Нет свободных слотов на ближайшие 14 дней
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {selectedSlot && (
        <BookingDialog
          eventType={eventType}
          slot={selectedSlot}
          open={!!selectedSlot}
          onOpenChange={(open) => {
            if (!open) setSelectedSlot(null);
          }}
          onBooked={() => {
            setSelectedSlot(null);
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
}
