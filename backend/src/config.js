import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from 'dotenv'

dotenv.config({path: '../.env'})

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const PORT = Number(process.env.PORT) || 4001;

/** Writable JSON file for dev/temp persistence (gitignored). */
export const DATA_FILE = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.join(__dirname, "..", "data", "data.json");
