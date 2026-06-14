# Booking API — сервис бронирования

## Подход

Design First: сначала API-контракт в TypeSpec, затем независимая реализация фронтенда и бэкенда по спецификации.

## ТипSpec-спецификация

API-контракт — единый источник правды. Файл `main.tsp`, компиляция через `npx tsp compile main.tsp`, OpenAPI-спецификация генерируется в `tsp-output/@typespec/openapi3/openapi.yaml`.

## Доменные сущности

- **Owner** — владелец календаря (id, name, email). Один предзаданный профиль.
- **EventType** — тип встречи (id, title, description, durationMinutes). Создаётся владельцем.
- **Slot** — вычисляемая сущность (startTime, endTime, eventTypeId). Не хранится в БД, выводится из EventType + существующих бронирований.
- **Booking** — бронирование (id, eventTypeId, startTime, endTime, status, guestName, guestEmail, createdAt). Status = confirmed.

## Роли

- **Владелец** — один предзаданный профиль, без авторизации. Создаёт типы событий, смотрит список бронирований.
- **Гость** — без аккаунта. Смотрит типы событий, выбирает свободный слот, бронирует.

## Правила бронирования

- На одно время — только одна запись, даже если типы событий разные.
- Окно записи: 14 дней от текущей даты.
- Слот временно резервируется при бронировании для предотвращения гонок.

## API-эндпоинты

| Метод | Путь | Роль | Описание |
|-------|------|------|----------|
| GET | /owner | Гость | Профиль владельца |
| POST | /event-types | Владелец | Создать тип события |
| GET | /event-types | Гость | Список типов событий |
| GET | /event-types/{id}/slots | Гость | Свободные слоты (14 дней, query: startDate?) |
| POST | /bookings | Гость | Создать бронирование |
| GET | /bookings | Владелец | Список предстоящих бронирований |

## Бэкенд

Отдельный сервер в директории `backend/`. Стек: Node.js + Express + TypeScript. Хранение в памяти (данные сбрасываются при перезапуске).

### Структура

- `src/index.ts` — Express-приложение, CORS, маршруты
- `src/store.ts` — in-memory хранилище (Owner, EventTypes, Bookings, резервирование слотов)
- `src/slots.ts` — генерация слотов (14 дней, 09:00–18:00, исключая занятые)
- `src/validation.ts` — валидация запросов (EventTypeCreate, BookingCreate)
- `src/routes/` — обработчики маршрутов (owner, eventTypes, bookings)

### Бизнес-правила

- Один слот — одно бронирование, даже если типы событий разные (409 Conflict)
- Окно бронирования: 14 дней от текущей даты
- endTime вычисляется сервером: startTime + durationMinutes
- createdAt генерируется сервером, не принимается от клиента

## Фронтенд

Отдельное SPA в директории `frontend/`. Стек: Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui. Работает с API по контракту, запросы проксируются через Vite на `localhost:3000`.

### Структура

- `src/types/api.ts` — типы по OpenAPI-контракту
- `src/lib/api.ts` — API-клиент (все 6 эндпоинтов)
- `src/hooks/useApi.ts` — хук загрузки данных
- `src/pages/` — страницы (EventTypesPage, BookingsPage, OwnerPage)
- `src/components/` — диалоги (CreateEventTypeDialog, SlotsDialog, BookingDialog) + Layout

### Маршруты

| Путь | Страница |
|------|----------|
| `/` | Типы событий + создание + слоты |
| `/bookings` | Список бронирований |
| `/owner` | Профиль владельца |

## Conventional Commits

Все коммиты — по спецификации Conventional Commits. Формат: `type(scope): description`.

- `feat:` — новая функция
- `fix:` — исправление бага
- `docs:` — документация
- `chore:` — обслуживание (зависимости, CI)
- `refactor:` — рефакторинг без изменения поведения
- `test:` — добавление или изменение тестов

Релизы формируются автоматически через release-please на основе коммитов с `feat:` и `fix:`.

## E2E-тесты

Playwright, директория `frontend/e2e/`. Запускаются вместе с бэкендом (webServer в playwright.config.ts).

Сценарии:
1. Гость видит профиль владельца
2. Создание типа события и появление в списке
3. Выбор слота и бронирование
4. Бронирование отображается в списке
5. Занятый слот исчезает из доступных

## Команды

- `npx tsp compile main.tsp` — скомпилировать TypeSpec → OpenAPI
- `npm install` — установить зависимости корня
- `cd frontend && npm install` — установить зависимости фронтенда
- `cd frontend && npm run dev` — dev-сервер фронтенда (порт 5173)
- `cd frontend && npm run build` — сборка фронтенда
- `cd frontend && npm run mock` — Prism-мок API по контракту (порт 3000)
- `cd backend && npm install` — установить зависимости бэкенда
- `cd backend && npm run dev` — dev-сервер бэкенда (порт 3000)
- `cd backend && npm run build` — сборка бэкенда
- `cd frontend && npm run test:e2e` — запуск Playwright e2e-тестов
