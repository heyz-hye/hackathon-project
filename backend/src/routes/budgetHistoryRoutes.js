import { Router } from "express";
import { getSupabase } from "../lib/supabase.js";
import { requireAuth } from "../middleware/requireAuth.js";

function firstDayOfMonth(d = new Date()) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function toDateOnlyIso(d) {
  const x = firstDayOfMonth(d);
  const y = x.getUTCFullYear();
  const m = String(x.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function totalSpent(row) {
  return (
    Number(row.rent || 0) +
    Number(row.food || 0) +
    Number(row.transport || 0) +
    Number(row.misc || 0)
  );
}

export function createBudgetHistoryRouter() {
  const router = Router();

  router.get("/monthly/current", requireAuth, async (req, res, next) => {
    try {
      const supabase = getSupabase();
      const ym = toDateOnlyIso(new Date());

      const { data, error } = await supabase
        .from("budget_history")
        .select("*")
        .eq("user_id", req.userId)
        .eq("year_month", ym)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        return res.json({
          yearMonth: ym,
          record: null,
        });
      }

      const spent = totalSpent(data);
      return res.json({
        yearMonth: ym,
        record: {
          ...data,
          total_spent: spent,
          remaining: Number(data.monthly_income) - spent,
        },
      });
    } catch (e) {
      if (e.statusCode === 503) return res.status(503).json({ error: e.message });
      next(e);
    }
  });

  router.get("/monthly/history", requireAuth, async (req, res, next) => {
    try {
      const supabase = getSupabase();
      const limit = Math.min(Number(req.query.limit) || 24, 60);

      const { data, error } = await supabase
        .from("budget_history")
        .select("*")
        .eq("user_id", req.userId)
        .order("year_month", { ascending: true })
        .limit(limit);

      if (error) throw error;

      const points = (data || []).map((row) => {
        const spent = totalSpent(row);
        return {
          year_month: row.year_month,
          monthly_income: Number(row.monthly_income),
          total_spent: spent,
          remaining: Number(row.monthly_income) - spent,
          rent: Number(row.rent),
          food: Number(row.food),
          transport: Number(row.transport),
          misc: Number(row.misc),
          uploaded_at: row.uploaded_at,
        };
      });

      return res.json({ history: points });
    } catch (e) {
      if (e.statusCode === 503) return res.status(503).json({ error: e.message });
      next(e);
    }
  });

  router.post("/monthly/save", requireAuth, async (req, res, next) => {
    try {
      const supabase = getSupabase();
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const monthly_income = Number(body.monthly_income);
      const rent = Number(body.rent);
      const food = Number(body.food);
      const transport = Number(body.transport);
      const misc = Number(body.misc);

      if (
        ![monthly_income, rent, food, transport, misc].every((n) =>
          Number.isFinite(n)
        )
      ) {
        return res.status(400).json({
          error: "monthly_income, rent, food, transport, and misc must be numbers",
        });
      }

      const year_month = toDateOnlyIso(new Date());
      const uploaded_at = new Date().toISOString();

      const { data, error } = await supabase
        .from("budget_history")
        .upsert(
          {
            user_id: req.userId,
            year_month,
            monthly_income,
            rent,
            food,
            transport,
            misc,
            uploaded_at,
          },
          { onConflict: "user_id,year_month" }
        )
        .select("*")
        .single();

      if (error) throw error;

      const spent = totalSpent(data);
      return res.json({
        record: {
          ...data,
          total_spent: spent,
          remaining: Number(data.monthly_income) - spent,
        },
      });
    } catch (e) {
      if (e.statusCode === 503) return res.status(503).json({ error: e.message });
      next(e);
    }
  });

  return router;
}
