import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GEMINI_API_KEY, GEMINI_MODEL } from "../config.js";
import { DERRY_AI_APP_CONTEXT } from "../constants/derryAiContext.js";
import { requireAuth } from "../middleware/requireAuth.js";

const MAX_MESSAGES = 48;
const MAX_MESSAGE_CHARS = 8000;

function toGeminiHistory(messages) {
  return messages.slice(0, -1).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Parse "Please retry in 18.21s" from Gemini / Google client errors. */
function parseRetryAfterMs(err) {
  const raw = err?.message ?? String(err);
  const m = /retry in ([\d.]+)\s*s/i.exec(raw);
  if (!m) return null;
  const sec = Number(m[1]);
  if (!Number.isFinite(sec)) return null;
  return Math.min(35_000, Math.ceil(sec * 1000) + 500);
}

function isRateLimitedError(err) {
  const raw = err?.message ?? String(err);
  return raw.includes("429") || raw.includes("Too Many Requests");
}

async function generateChatReply(model, messages, lastUserText) {
  const history = toGeminiHistory(messages);
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const chat = model.startChat({ history });
      const result = await chat.sendMessage(lastUserText);
      return result.response.text();
    } catch (e) {
      if (!isRateLimitedError(e) || attempt === maxAttempts - 1) {
        throw e;
      }
      const waitMs =
        parseRetryAfterMs(e) ?? Math.min(8000, 1500 * 2 ** attempt);
      await sleep(waitMs);
    }
  }
}

export function createDerryAiRouter() {
  const router = Router();

  /**
   * POST /api/chat  (requires Authorization: Bearer <jwt>)
   * Body: { messages: Array<{ role: "user" | "assistant", content: string }> }
   * Returns: { reply: string }
   */
  router.post("/", requireAuth, async (req, res, next) => {
    try {
      if (!GEMINI_API_KEY) {
        return res.status(503).json({
          error:
            "Chat is not configured: set GEMINI_API_KEY in the server environment.",
        });
      }

      const { messages } = req.body ?? {};
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          error: "Expected a non-empty messages array.",
        });
      }
      if (messages.length > MAX_MESSAGES) {
        return res.status(400).json({
          error: `At most ${MAX_MESSAGES} messages per request.`,
        });
      }

      for (const m of messages) {
        if (
          !m ||
          (m.role !== "user" && m.role !== "assistant") ||
          typeof m.content !== "string"
        ) {
          return res.status(400).json({
            error:
              'Each message must have role "user" or "assistant" and string content.',
          });
        }
        if (m.content.length > MAX_MESSAGE_CHARS) {
          return res.status(400).json({
            error: `Each message must be at most ${MAX_MESSAGE_CHARS} characters.`,
          });
        }
      }

      const last = messages[messages.length - 1];
      if (last.role !== "user") {
        return res.status(400).json({
          error: "The last message must be from the user.",
        });
      }

      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        systemInstruction: DERRY_AI_APP_CONTEXT,
      });

      const reply = await generateChatReply(model, messages, last.content);

      return res.json({ reply: reply ?? "" });
    } catch (e) {
      const msg = e?.message || String(e);
      if (
        msg.includes("API key") ||
        msg.includes("API_KEY_INVALID") ||
        msg.includes("403")
      ) {
        return res.status(503).json({
          error: "Gemini API key is missing or invalid.",
        });
      }
      if (isRateLimitedError(e)) {
        return res.status(429).json({
          error:
            "Gemini rate limit or free-tier quota was reached. Wait a bit and try again, or set GEMINI_MODEL to another model in .env (e.g. gemini-1.5-flash vs gemini-2.0-flash). See https://ai.google.dev/gemini-api/docs/rate-limits",
        });
      }
      next(e);
    }
  });

  return router;
}
