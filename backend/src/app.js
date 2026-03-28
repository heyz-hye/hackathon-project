import express from "express";
import cors from "cors";
import { Router } from "express";
import { healthRouter } from "./routes/health.js";
import { randomUUID } from "node:crypto";
import { generateBudgetSheet } from "./controllers/budgetController.js";
import { createLibraryPlacesRouter } from "./routes/libraryPlaces.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { createApiRouter } from "./routes/api.js";

export function createApp(store) {
  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use("/api/health", healthRouter);
  app.use("/api/libraries/places", createLibraryPlacesRouter());
  app.use("/api", createApiRouter(store));
  app.use(errorHandler);

  return app;
}