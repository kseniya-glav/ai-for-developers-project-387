import { useState } from "react";
import { api } from "@/lib/api";
import type { ApiError } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function CreateEventTypeDialog({ open, onOpenChange, onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createEventType({
        title,
        description,
        durationMinutes: duration,
      });
      toast.success("Тип события создан");
      setTitle("");
      setDescription("");
      setDuration(30);
      onOpenChange(false);
      onCreated();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      toast.error(apiErr.message || "Ошибка создания");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый тип события</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Название</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Описание</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              maxLength={2000}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Длительность (мин)</Label>
            <Input
              id="duration"
              type="number"
              min={15}
              max={480}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Создание…" : "Создать"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
