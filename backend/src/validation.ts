interface FieldError {
  field: string;
  message: string;
}

export function validateEventTypeCreate(body: unknown): FieldError[] {
  const errors: FieldError[] = [];
  if (!body || typeof body !== "object") return [{ field: "", message: "Тело запроса обязательно" }];

  const data = body as Record<string, unknown>;

  if (!data.title || typeof data.title !== "string")
    errors.push({ field: "title", message: "Название обязательно" });

  if (!data.description || typeof data.description !== "string")
    errors.push({ field: "description", message: "Описание обязательно" });
  else if (data.description.length > 2000)
    errors.push({ field: "description", message: "Описание не более 2000 символов" });

  if (data.durationMinutes == null || typeof data.durationMinutes !== "number")
    errors.push({ field: "durationMinutes", message: "Длительность обязательна" });
  else if (data.durationMinutes < 15 || data.durationMinutes > 480)
    errors.push({ field: "durationMinutes", message: "Длительность от 15 до 480 минут" });

  return errors;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateBookingCreate(body: unknown): FieldError[] {
  const errors: FieldError[] = [];
  if (!body || typeof body !== "object") return [{ field: "", message: "Тело запроса обязательно" }];

  const data = body as Record<string, unknown>;

  if (!data.eventTypeId || typeof data.eventTypeId !== "string")
    errors.push({ field: "eventTypeId", message: "ID типа события обязателен" });

  if (!data.startTime || typeof data.startTime !== "string") {
    errors.push({ field: "startTime", message: "Время начала обязательно" });
  } else if (isNaN(Date.parse(data.startTime))) {
    errors.push({ field: "startTime", message: "Некорректный формат даты" });
  } else {
    const start = new Date(data.startTime);
    const now = new Date();
    const maxDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    if (start < now) {
      errors.push({ field: "startTime", message: "Время начала не может быть в прошлом" });
    } else if (start > maxDate) {
      errors.push({ field: "startTime", message: "Бронирование возможно не более чем на 14 дней вперёд" });
    }
  }

  if (!data.guestName || typeof data.guestName !== "string")
    errors.push({ field: "guestName", message: "Имя гостя обязательно" });

  if (!data.guestEmail || typeof data.guestEmail !== "string") {
    errors.push({ field: "guestEmail", message: "Email гостя обязателен" });
  } else if (!EMAIL_RE.test(data.guestEmail)) {
    errors.push({ field: "guestEmail", message: "Некорректный формат email" });
  }

  return errors;
}
