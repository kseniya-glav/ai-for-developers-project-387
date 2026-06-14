import { Router } from "express";
import { createBooking, listBookings } from "../store.js";
import { validateBookingCreate } from "../validation.js";

const router = Router();

router.post("/bookings", (req, res) => {
  const errors = validateBookingCreate(req.body);
  if (errors.length) {
    res.status(400).json({
      code: "BAD_REQUEST",
      message: errors.map((e) => e.message).join("; "),
    });
    return;
  }

  const result = createBooking(req.body);

  if (result === "NOT_FOUND") {
    res.status(404).json({
      code: "NOT_FOUND",
      message: "Тип события не найден",
    });
    return;
  }

  if (result === "CONFLICT") {
    res.status(409).json({
      code: "CONFLICT",
      message: "Выбранное время уже занято",
    });
    return;
  }

  res.json(result);
});

router.get("/bookings", (_req, res) => {
  res.json(listBookings());
});

export default router;
