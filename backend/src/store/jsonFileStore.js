import fs from "node:fs/promises";
import path from "node:path";

const COLLECTIONS = ["pantries", "libraries", "apartments"];

function emptyState() {
  return {
    pantries: [],
    libraries: [],
    apartments: [],
  };
}

export function createJsonFileStore(filePath) {
  let cache = null;

  async function ensureLoaded() {
    if (cache) return cache;
    try {
      const raw = await fs.readFile(filePath, "utf8");
      cache = { ...emptyState(), ...JSON.parse(raw) };
      for (const key of COLLECTIONS) {
        if (!Array.isArray(cache[key])) cache[key] = [];
      }
    } catch (err) {
      if (err.code !== "ENOENT") throw err;
      cache = emptyState();
      await persist();
    }
    return cache;
  }

  async function persist() {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(cache, null, 2), "utf8");
  }

  async function getAll(collection) {
    const state = await ensureLoaded();
    if (!COLLECTIONS.includes(collection)) {
      throw new Error(`Unknown collection: ${collection}`);
    }
    return [...state[collection]];
  }

  async function getById(collection, id) {
    const items = await getAll(collection);
    return items.find((item) => item.id === id) ?? null;
  }

  async function create(collection, item) {
    const state = await ensureLoaded();
    state[collection].push(item);
    await persist();
    return item;
  }

  async function update(collection, id, patch) {
    const state = await ensureLoaded();
    const idx = state[collection].findIndex((item) => item.id === id);
    if (idx === -1) return null;
    state[collection][idx] = { ...state[collection][idx], ...patch, id };
    await persist();
    return state[collection][idx];
  }

  async function remove(collection, id) {
    const state = await ensureLoaded();
    const before = state[collection].length;
    state[collection] = state[collection].filter((item) => item.id !== id);
    if (state[collection].length === before) return false;
    await persist();
    return true;
  }

  return {
    collections: COLLECTIONS,
    getAll,
    getById,
    create,
    update,
    remove,
  };
}
