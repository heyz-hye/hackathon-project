"use client";

import { useMemo, useState } from "react";

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
  const [income, setIncome] = useState("2400");
  const [expenses, setExpenses] = useState<Record<ExpenseKey, string>>({
    rent: "1200",
    food: "350",
    transport: "127",
    misc: "200",
  });

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

  return (
    <div className="space-y-6">
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
            title="Connects to the Java backend for export."
            className="btn-ghost px-4 py-2 text-sm"
          >
            Download as Excel
          </button>
        </div>
      </div>
    </div>
  );
}
