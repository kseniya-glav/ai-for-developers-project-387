import { useState } from "react";
import { api } from "@/lib/api";
import type { EventType, Slot, ApiError } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";

interface Props {
  eventType: EventType;
  slot: Slot;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBooked: () => void;
}

export function BookingDialog({
  eventType,
  slot,
  open,
  onOpenChange,
  onBooked,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createBooking({
        eventTypeId: eventType.id,
        startTime: slot.startTime,
        guestName: name,
        guestEmail: email,
      });
      toast.success("Бронирование создано!");
      setName("");
      setEmail("");
      onOpenChange(false);
      onBooked();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message || "Ошибка бронирования");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Бронирование: {eventType.title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {format(parseISO(slot.startTime), "d MMMM yyyy, HH:mm", {
            locale: ru,
          })}{" "}
          — {format(parseISO(slot.endTime), "HH:mm")} ({eventType.durationMinutes} мин)
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guestName">Ваше имя</Label>
            <Input
              id="guestName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="guestEmail">Email</Label>
            <Input
              id="guestEmail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Бронирование…" : "Забронировать"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
