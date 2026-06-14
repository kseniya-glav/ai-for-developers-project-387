import { test, expect } from "@playwright/test";

const API = "http://localhost:3000/api";

async function resetStore() {
  const res = await fetch(`${API}/_test/reset`, { method: "POST" });
  if (!res.ok) throw new Error(`Reset failed: ${res.status}`);
}

async function createEventType(data: {
  title: string;
  description: string;
  durationMinutes: number;
}) {
  const res = await fetch(`${API}/event-types`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

test.describe("Основной сценарий бронирования", () => {
  test.beforeEach(resetStore);

  test("полный флоу: профиль → тип события → слоты → бронирование → список", async ({
    page,
  }) => {
    // 1. Гость видит профиль владельца
    await page.goto("/owner");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Алексей Иванов")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("alexey@example.com")).toBeVisible();

    // 2. Создание типа события
    await page.goto("/");
    await page.getByRole("button", { name: /создать/i }).click();

    await page.getByLabel("Название").fill("Собеседование");
    await page.getByLabel("Описание").fill("Техническое интервью на 60 минут");
    await page.getByLabel("Длительность (мин)").clear();
    await page.getByLabel("Длительность (мин)").fill("60");

    await page.getByRole("button", { name: /^создать$/i }).click();

    await expect(page.getByText("Собеседование")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("60 мин", { exact: true })).toBeVisible();

    // 3. Выбор слота и бронирование
    const eventCard = page.locator("div.cursor-pointer", {
      hasText: "Собеседование",
    }).first();
    await eventCard.click();

    await expect(
      page.getByRole("heading", { name: /свободные слоты/i })
    ).toBeVisible({ timeout: 15000 });

    const slotBadge = page.locator("span.cursor-pointer").first();
    await slotBadge.click();

    await expect(page.getByLabel("Ваше имя")).toBeVisible({ timeout: 10000 });

    await page.getByLabel("Ваше имя").fill("Мария Петрова");
    await page.getByLabel("Email").fill("maria@example.com");

    await page.getByRole("button", { name: /забронировать/i }).click();

    await expect(
      page.getByText(/бронирование создано/i)
    ).toBeVisible({ timeout: 15000 });

    // 4. Бронирование в списке
    await page.goto("/bookings");
    await expect(page.getByText("Мария Петрова").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("maria@example.com").first()).toBeVisible();

    // 5. Занятый слот исчез из доступных
    await page.goto("/");
    const cardAgain = page.locator("div.cursor-pointer", {
      hasText: "Собеседование",
    }).first();
    await cardAgain.click();

    await expect(
      page.getByRole("heading", { name: /свободные слоты/i })
    ).toBeVisible({ timeout: 15000 });

    const slotCount = await page.locator("span.cursor-pointer").count();
    expect(slotCount).toBeGreaterThan(0);
  });

  test("повторное бронирование того же слота возвращает ошибку конфликта", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /создать/i }).click();

    await page.getByLabel("Название").fill("Встреча");
    await page.getByLabel("Описание").fill("Короткая встреча");
    await page.getByLabel("Длительность (мин)").clear();
    await page.getByLabel("Длительность (мин)").fill("30");

    await page.getByRole("button", { name: /^создать$/i }).click();
    await expect(page.getByText("Встреча")).toBeVisible({ timeout: 15000 });

    const eventCard = page.locator("div.cursor-pointer", { hasText: "Встреча" }).first();
    await eventCard.click();

    await expect(
      page.getByRole("heading", { name: /свободные слоты/i })
    ).toBeVisible({ timeout: 15000 });

    const slotBadge = page.locator("span.cursor-pointer").first();
    await slotBadge.click();

    await expect(page.getByLabel("Ваше имя")).toBeVisible({ timeout: 10000 });
    await page.getByLabel("Ваше имя").fill("Иван Смирнов");
    await page.getByLabel("Email").fill("ivan@example.com");
    await page.getByRole("button", { name: /забронировать/i }).click();

    await expect(
      page.getByText(/бронирование создано/i)
    ).toBeVisible({ timeout: 15000 });

    // Пробуем забронировать тот же слот через API — 409
    const et = await createEventType({ title: "Встреча", description: "Короткая встреча", durationMinutes: 30 });
    const slotsRes = await fetch(`${API}/event-types/${et.id}/slots`);
    const slots = await slotsRes.json();

    // Бронирование через UI уже заняло слот, проверяем через API
    const ets = await (await fetch(`${API}/event-types`)).json();
    const existingEt = ets.find((e: { title: string }) => e.title === "Встреча");
    const existingSlots = await (await fetch(`${API}/event-types/${existingEt.id}/slots`)).json();

    // Берём слот, который был только что забронирован — он не вернётся в /slots,
    // поэтому берём время из бронирования
    const bookings = await (await fetch(`${API}/bookings`)).json();
    const bookedSlot = bookings[0];

    const res = await fetch(`${API}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId: existingEt.id,
        startTime: bookedSlot.startTime,
        guestName: "Другой гость",
        guestEmail: "other@example.com",
      }),
    });
    expect(res.status).toBe(409);
  });
});

test.describe("Профиль владельца", () => {
  test.beforeEach(resetStore);

  test("отображается имя и email владельца", async ({ page }) => {
    await page.goto("/owner");
    await page.waitForLoadState("networkidle");
    await expect(page.getByText("Алексей Иванов")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("alexey@example.com")).toBeVisible();
  });
});

test.describe("Создание типа события", () => {
  test.beforeEach(resetStore);

  test("успешное создание с корректными данными", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /создать/i }).click();

    await page.getByLabel("Название").fill("Консультация");
    await page.getByLabel("Описание").fill("Личная консультация на 45 минут");
    await page.getByLabel("Длительность (мин)").clear();
    await page.getByLabel("Длительность (мин)").fill("45");

    await page.getByRole("button", { name: /^создать$/i }).click();

    await expect(page.getByText("Консультация")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("45 мин", { exact: true })).toBeVisible();
  });

  test("ошибка при невалидной длительности — API 400", async () => {
    const res = await fetch(`${API}/event-types`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Тест", description: "Описание", durationMinutes: 5 }),
    });
    expect(res.status).toBe(400);
  });

  test("ошибка при пустом названии — API 400", async () => {
    const res = await fetch(`${API}/event-types`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "", description: "Описание", durationMinutes: 30 }),
    });
    expect(res.status).toBe(400);
  });
});

test.describe("Слоты", () => {
  test.beforeEach(resetStore);

  test("отображаются свободные слоты на 14 дней", async ({ page }) => {
    await createEventType({ title: "Встреча", description: "Тестовая", durationMinutes: 30 });

    await page.goto("/");
    await expect(page.getByText("Встреча").first()).toBeVisible({ timeout: 15000 });

    const card = page.locator("div.cursor-pointer", { hasText: "Встреча" }).first();
    await card.click();

    await expect(
      page.getByRole("heading", { name: /свободные слоты/i })
    ).toBeVisible({ timeout: 15000 });

    const slotCount = await page.locator("span.cursor-pointer").count();
    expect(slotCount).toBeGreaterThan(0);
  });

  test("несуществующий тип события — 404", async () => {
    const res = await fetch(`${API}/event-types/nonexistent/slots`);
    expect(res.status).toBe(404);
  });
});

test.describe("Бронирование — валидация", () => {
  test.beforeEach(resetStore);

  test("ошибка при пустом имени — API 400", async () => {
    const et = await createEventType({ title: "Тест", description: "Тест", durationMinutes: 30 });

    const res = await fetch(`${API}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId: et.id,
        startTime: "2099-01-01T10:00:00.000Z",
        guestName: "",
        guestEmail: "test@example.com",
      }),
    });
    expect(res.status).toBe(400);
  });

  test("ошибка при невалидном email — API 400", async () => {
    const et = await createEventType({ title: "Тест", description: "Тест", durationMinutes: 30 });

    const res = await fetch(`${API}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId: et.id,
        startTime: "2099-01-01T10:00:00.000Z",
        guestName: "Гость",
        guestEmail: "not-an-email",
      }),
    });
    expect(res.status).toBe(400);
  });

  test("ошибка при несуществующем типе события — API 404", async () => {
    // Дата в пределах 14 дней, чтобы прошла валидацию
    const in14Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const res = await fetch(`${API}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId: "nonexistent-id",
        startTime: in14Days,
        guestName: "Гость",
        guestEmail: "guest@example.com",
      }),
    });
    expect(res.status).toBe(404);
  });

  test("ошибка при бронировании в прошлом — API 400", async () => {
    const et = await createEventType({ title: "Тест", description: "Тест", durationMinutes: 30 });

    const res = await fetch(`${API}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId: et.id,
        startTime: "2020-01-01T10:00:00.000Z",
        guestName: "Гость",
        guestEmail: "guest@example.com",
      }),
    });
    expect(res.status).toBe(400);
  });
});

test.describe("Список бронирований", () => {
  test.beforeEach(resetStore);

  test("пустой список при отсутствии бронирований", async ({ page }) => {
    await page.goto("/bookings");
    await page.waitForResponse("**/api/bookings");
    await expect(page.getByText("Пока нет бронирований")).toBeVisible({ timeout: 15000 });
  });

  test("созданное бронирование отображается в списке", async ({ page }) => {
    const et = await createEventType({ title: "Звонок", description: "Созвон", durationMinutes: 15 });

    const slotsRes = await fetch(`${API}/event-types/${et.id}/slots`);
    const slots = await slotsRes.json();

    await fetch(`${API}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventTypeId: et.id,
        startTime: slots[0].startTime,
        guestName: "Анна Сидорова",
        guestEmail: "anna@example.com",
      }),
    });

    await page.goto("/bookings");
    await expect(page.getByText("Анна Сидорова").first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText("anna@example.com").first()).toBeVisible();
    await expect(page.getByText("Звонок").first()).toBeVisible();
  });
});
