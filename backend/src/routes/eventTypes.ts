import { Router } from "express";
import {
  createEventType,
  listEventTypes,
  getEventType,
  getAllBookings,
} from "../store.js";
import { generateSlots } from "../slots.js";
import { validateEventTypeCreate } from "../validation.js";

const router = Router();

router.post("/event-types", (req, res) => {
  const errors = validateEventTypeCreate(req.body);
  if (errors.length) {
    res.status(400).json({
      code: "BAD_REQUEST",
      message: errors.map((e) => e.message).join("; "),
    });
    return;
  }

  const et = createEventType(req.body);
  res.json(et);
});

router.get("/event-types", (_req, res) => {
  res.json(listEventTypes());
});

router.get("/event-types/:eventTypeId/slots", (req, res) => {
  const { eventTypeId } = req.params;
  const startDate = req.query.startDate as string | undefined;

  const et = getEventType(eventTypeId);
  if (!et) {
    res.status(404).json({
      code: "NOT_FOUND",
      message: "Тип события не найден",
    });
    return;
  }

  if (startDate && isNaN(Date.parse(startDate))) {
    res.status(400).json({
      code: "BAD_REQUEST",
      message: "Некорректный формат startDate",
    });
    return;
  }

  const slots = generateSlots(et, startDate, getAllBookings());
  res.json(slots);
});

export default router;
