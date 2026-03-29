import { Router } from "express";
import bcrypt from "bcrypt";
import { getSupabase } from "../lib/supabase.js";
import { signUserToken, verifyUserToken } from "../lib/authTokens.js";
import { requireAuth } from "../middleware/requireAuth.js";

const SALT_ROUNDS = 10;

export function createAuthRouter() {
  const router = Router();

  router.post("/register", async (req, res, next) => {
    try {
      const supabase = getSupabase();
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const username = String(body.username || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");

      if (!username || !email || !password) {
        return res.status(400).json({ error: "username, email, and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      const { data, error } = await supabase
        .from("users")
        .insert({ username, email, password_hash })
        .select("id, username, email, created_at")
        .single();

      if (error) {
        if (error.code === "23505") {
          return res.status(409).json({ error: "Username or email already registered" });
        }
        throw error;
      }

      const token = signUserToken(data.id);
      return res.status(201).json({ token, user: data });
    } catch (e) {
      if (e.statusCode === 503) return res.status(503).json({ error: e.message });
      next(e);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const supabase = getSupabase();
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "");

      if (!email || !password) {
        return res.status(400).json({ error: "email and password are required" });
      }

      const { data: user, error } = await supabase
        .from("users")
        .select("id, username, email, password_hash, created_at")
        .eq("email", email)
        .maybeSingle();

      if (error) throw error;
      if (!user?.password_hash) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const { password_hash: _h, ...safe } = user;
      const token = signUserToken(user.id);
      return res.json({ token, user: safe });
    } catch (e) {
      if (e.statusCode === 503) return res.status(503).json({ error: e.message });
      next(e);
    }
  });

  router.get("/me", requireAuth, async (req, res, next) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("users")
        .select("id, username, email, created_at")
        .eq("id", req.userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "User not found" });
      return res.json({ user: data });
    } catch (e) {
      if (e.statusCode === 503) return res.status(503).json({ error: e.message });
      next(e);
    }
  });

  /** Optional: verify token shape without DB hit (client bootstrap). */
  router.get("/verify", (req, res) => {
    const raw = req.headers.authorization;
    const token = raw?.startsWith("Bearer ") ? raw.slice(7) : null;
    if (!token) return res.status(401).json({ valid: false });
    try {
      const payload = verifyUserToken(token);
      return res.json({ valid: true, userId: payload.sub });
    } catch {
      return res.status(401).json({ valid: false });
    }
  });

  return router;
}
