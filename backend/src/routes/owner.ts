import { Router } from "express";
import { getOwner } from "../store.js";

const router = Router();

router.get("/owner", (_req, res) => {
  res.json(getOwner());
});

export default router;
