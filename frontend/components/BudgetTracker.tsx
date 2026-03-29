"use client";

import { useAuth } from "@/contexts/AuthContext";
import { API_BASE, authHeaders } from "@/lib/api";
import { useCallback, useEffect, useMemo, useState } from "react";
import BudgetHistoryChart, {
  type BudgetHistoryPoint,
} from "@/components/BudgetHistoryChart";

type ExpenseKey = "rent" | "food" | "transport" | "misc";

const labels: Record<ExpenseKey, string> = {
  rent: "Rent",
  food: "Food",
  transport: "Transport",
  misc: "Misc",
};

function parseNum(v: string) {
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export default function BudgetTracker() {
  const { token } = useAuth();
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState<Record<ExpenseKey, string>>({
    rent: "",
    food: "",
    transport: "",
    misc: "",
  });
  const [history, setHistory] = useState<BudgetHistoryPoint[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadCurrent = useCallback(async () => {
    if (!token) return;
    setLoadError(null);
    try {
      const res = await fetch(`${API_BASE}/api/budget/monthly/current`, {
        headers: authHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not load budget");
      }
      if (data.record) {
        const r = data.record;
        setIncome(String(r.monthly_income ?? ""));
        setExpenses({
          rent: String(r.rent ?? ""),
          food: String(r.food ?? ""),
          transport: String(r.transport ?? ""),
          misc: String(r.misc ?? ""),
        });
      }
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Load failed");
    }
  }, [token]);

  const loadHistory = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/budget/monthly/history?limit=36`, {
        headers: authHeaders(token),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Could not load history");
      }
      setHistory(data.history || []);
    } catch {
      setHistory([]);
    }
  }, [token]);

  useEffect(() => {
    void loadCurrent();
    void loadHistory();
  }, [loadCurrent, loadHistory]);

  const incomeN = parseNum(income);
  const expenseBreakdown = useMemo(() => {
    const rent = parseNum(expenses.rent);
    const food = parseNum(expenses.food);
    const transport = parseNum(expenses.transport);
    const misc = parseNum(expenses.misc);
    return { rent, food, transport, misc, total: rent + food + transport + misc };
  }, [expenses]);

  const remaining = incomeN - expenseBreakdown.total;
  const ratio =
    incomeN > 0 ? Math.min(100, (expenseBreakdown.total / incomeN) * 100) : 0;

  const status =
    remaining < 0
      ? { label: "Over budget", className: "status-red" }
      : ratio >= 90
        ? { label: "Tight", className: "status-amber" }
        : { label: "Healthy", className: "status-green" };

  function setExpense(key: ExpenseKey, value: string) {
    setExpenses((prev) => ({ ...prev, [key]: value }));
  }

  const handleSaveMonthly = async () => {
    if (!token) return;
    setSaveError(null);
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/budget/monthly/save`, {
        method: "POST",
        headers: authHeaders(token),
        body: JSON.stringify({
          monthly_income: incomeN,
          rent: expenseBreakdown.rent,
          food: expenseBreakdown.food,
          transport: expenseBreakdown.transport,
          misc: expenseBreakdown.misc,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Save failed");
      }
      await loadHistory();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/budget/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          income: incomeN,
          rent: parseNum(expenses.rent),
          food: parseNum(expenses.food),
          transport: parseNum(expenses.transport),
          misc: parseNum(expenses.misc),
        }),
      });
      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "budget.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading Excel:", error);
      alert("Failed to download Excel file");
    }
  };

  return (
    <div className="space-y-6">
      {loadError ? (
        <p className="font-mono text-sm text-[#FF6B6B]" role="alert">
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-[#FF6B6B]">
            Monthly income
          </span>
          <input
            type="text"
            inputMode="decimal"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="input-hud w-full"
            placeholder="0"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {(Object.keys(labels) as ExpenseKey[]).map((key) => (
          <label key={key} className="flex flex-col gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-[#A89090]">
              {labels[key]}
            </span>
            <input
              type="text"
              inputMode="decimal"
              value={expenses[key]}
              onChange={(e) => setExpense(key, e.target.value)}
              className="input-hud w-full"
              placeholder="0"
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void handleSaveMonthly()}
          disabled={saving || !token}
          className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save monthly income info"}
        </button>
        {saveError ? (
          <span className="font-mono text-sm text-[#FF6B6B]">{saveError}</span>
        ) : null}
      </div>

      <div className="glass-card rounded-xl border border-[rgba(192,57,43,0.25)] p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-[#A89090]">
              Total expenses
            </p>
            <p className="font-mono text-2xl text-[#F5F5F5] [text-shadow:0_0_10px_rgba(255,45,45,0.35)]">
              ${expenseBreakdown.total.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-[#A89090]">
              Remaining
            </p>
            <p
              className={`font-mono text-2xl ${
                remaining < 0 ? "text-[#FF2D2D]" : "text-[#F5F5F5]"
              } [text-shadow:0_0_10px_rgba(255,45,45,0.35)]`}
            >
              ${remaining.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
          <span
            className={`rounded-full border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wide ${status.className}`}
          >
            {status.label}
          </span>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between font-mono text-xs text-[#A89090]">
            <span>Budget usage</span>
            <span>{ratio.toFixed(0)}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#1A0D0D] ring-1 ring-[rgba(192,57,43,0.35)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#C0392B] via-[#E74C3C] to-[#FF2D2D] shadow-[0_0_16px_rgba(255,45,45,0.45)] transition-all duration-500"
              style={{ width: `${Math.min(100, ratio)}%` }}
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleDownloadExcel}
            title="Download budget as Excel file"
            className="btn-ghost px-4 py-2 text-sm"
          >
            Download as Excel
          </button>
        </div>
      </div>

      <section className="glass-card rounded-xl border border-[rgba(192,57,43,0.25)] p-6">
        <h3 className="font-sans text-lg font-semibold text-[#F5F5F5]">
          Monthly income vs spending
        </h3>
        <p className="mt-1 font-sans text-sm text-[#A89090]">
          Each point is one calendar month. Updates when you save monthly income info.
        </p>
        <div className="mt-6">
          <BudgetHistoryChart data={history} />
        </div>
      </section>
    </div>
  );
}
