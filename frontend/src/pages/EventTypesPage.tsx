import { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi";
import { api } from "@/lib/api";
import type { EventType } from "@/types/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { CreateEventTypeDialog } from "@/components/CreateEventTypeDialog";
import { SlotsDialog } from "@/components/SlotsDialog";

export function EventTypesPage() {
  const { data: eventTypes, loading, error, refetch } = useApi(
    useCallback(() => api.listEventTypes(), [])
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [slotsEventType, setSlotsEventType] = useState<EventType | null>(null);

  if (loading) return <p className="text-muted-foreground">Загрузка…</p>;
  if (error) return <p className="text-destructive">{error}</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Типы событий</h1>
          <p className="text-muted-foreground">
            Выберите тип события, чтобы посмотреть свободные слоты
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Создать
        </Button>
      </div>

      {!eventTypes?.length ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Пока нет типов событий. Создайте первый.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {eventTypes.map((et) => (
            <Card
              key={et.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => setSlotsEventType(et)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{et.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {et.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {et.durationMinutes} мин
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateEventTypeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={refetch}
      />

      {slotsEventType && (
        <SlotsDialog
          eventType={slotsEventType}
          open={!!slotsEventType}
          onOpenChange={(open) => {
            if (!open) setSlotsEventType(null);
          }}
        />
      )}
    </div>
  );
}
