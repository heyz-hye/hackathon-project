import { Router } from "express";
import { randomUUID } from "node:crypto";
import zillowController  from './../controllers/zillowController.js'

export function createApiRouter(store) {
  const router = Router();

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

  router.get('/places-to-rent', zillowController.getZillowData)

  return router;
}
