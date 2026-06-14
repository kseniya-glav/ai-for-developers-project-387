### Hexlet tests and linter status:
[![Actions Status](https://github.com/kseniya-glav/ai-for-developers-project-386/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/kseniya-glav/ai-for-developers-project-386/actions)

# Booking API — сервис бронирования

Сервис бронирования по типу Cal.com. Owner создаёт типы событий, гости выбирают свободные слоты и бронируют.

**Демо:** https://ai-for-developers-project-386-poy6.onrender.com

## Запуск через Docker

```bash
docker build -t booking-app .
docker run -p 3000:3000 booking-app
```

Приложение доступно на http://localhost:3000

## Переменные окружения

| Переменная | По умолчанию | Описание |
|---|---|---|
| `PORT` | `3000` | Порт сервера |
| `OWNER_NAME` | Алексей Иванов | Имя владельца |
| `OWNER_EMAIL` | alexey@example.com | Email владельца |
| `CORS_ORIGINS` | http://localhost:5173 | Разрешённые origins (через запятую) |

## Деплой на Render

1. Подключите GitHub-репозиторий к Render
2. Выберите **Docker** как runtime
3. Render автоматически обнаружит `render.yaml`
4. Переменная `PORT` задаётся Render автоматически
