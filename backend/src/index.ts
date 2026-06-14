import express from "express";
import cors from "cors";
import ownerRouter from "./routes/owner.js";
import eventTypesRouter from "./routes/eventTypes.js";
import bookingsRouter from "./routes/bookings.js";
import { resetStore } from "./store.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Test-only endpoint to reset in-memory store
app.post("/api/_test/reset", (_req, res) => {
  resetStore();
  res.json({ ok: true });
});

// API routes under /api
app.use("/api", ownerRouter);
app.use("/api", eventTypesRouter);
app.use("/api", bookingsRouter);

// Serve static frontend files
app.use(express.static(path.join(__dirname, "../public")));

// SPA fallback — serve index.html for any non-API, non-static route
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, () => {
  console.log(`Booking API running on port ${PORT}`);
});
