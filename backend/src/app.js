import express from "express";
import cors from "cors";
import { Router } from "express";
import { randomUUID } from "node:crypto";
import { generateBudgetSheet } from "./controllers/budgetController.js";
import { errorHandler } from "./middleware/errorHandler.js";

export function createApiRouter(store) {
  const router = Router();

  // Budget download route
  router.post('/budget/download', generateBudgetSheet);

  for (const collection of store.collections) {
    router.get(`/${collection}`, async (req, res, next) => {
      try {
        res.json(await store.getAll(collection));
      } catch (e) {
        next(e);
      }
    });

    router.get(`/${collection}/:id`, async (req, res, next) => {
      try {
        const item = await store.getById(collection, req.params.id);
        if (!item) return res.status(404).json({ error: "Not found" });
        res.json(item);
      } catch (e) {
        next(e);
      }
    });

    router.post(`/${collection}`, async (req, res, next) => {
      try {
        const body = req.body && typeof req.body === "object" ? req.body : {};
        const { id: _ignore, ...rest } = body;
        const item = { ...rest, id: randomUUID() };
        await store.create(collection, item);
        res.status(201).json(item);
      } catch (e) {
        next(e);
      }
    });

    router.patch(`/${collection}/:id`, async (req, res, next) => {
      try {
        const patch =
          req.body && typeof req.body === "object" ? req.body : {};
        const { id: _ignore, ...rest } = patch;
        const updated = await store.update(collection, req.params.id, rest);
        if (!updated) return res.status(404).json({ error: "Not found" });
        res.json(updated);
      } catch (e) {
        next(e);
      }
    });

    router.delete(`/${collection}/:id`, async (req, res, next) => {
      try {
        const ok = await store.remove(collection, req.params.id);
        if (!ok) return res.status(404).json({ error: "Not found" });
        res.status(204).send();
      } catch (e) {
        next(e);
      }
    });
  }

  return router;
}

export function createApp(store) {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use('/api', createApiRouter(store));

  // Error handler
  app.use(errorHandler);

  return app;
}