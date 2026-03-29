"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type BudgetHistoryPoint = {
  year_month: string;
  monthly_income: number;
  total_spent: number;
};

function formatMonth(ym: string) {
  const d = new Date(ym + (ym.includes("T") ? "" : "T12:00:00Z"));
  if (Number.isNaN(d.getTime())) return ym;
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export default function BudgetHistoryChart({
  data,
}: {
  data: BudgetHistoryPoint[];
}) {
  if (!data.length) {
    return (
      <p className="font-sans text-sm text-[#A89090]">
        Save your monthly budget to see income and spending over time.
      </p>
    );
  }

  const chartData = data.map((d) => ({
    label: formatMonth(d.year_month),
    income: d.monthly_income,
    spent: d.total_spent,
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(192,57,43,0.2)" />
          <XAxis dataKey="label" tick={{ fill: "#A89090", fontSize: 11 }} />
          <YAxis
            tick={{ fill: "#A89090", fontSize: 11 }}
            tickFormatter={(v) =>
              `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
            }
          />
          <Tooltip
            contentStyle={{
              background: "rgba(18, 10, 10, 0.95)",
              border: "1px solid rgba(192, 57, 43, 0.35)",
              borderRadius: "0.5rem",
              color: "#F5F5F5",
            }}
            formatter={(value) =>
              `$${Number(value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
            }
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="income"
            name="Monthly income"
            stroke="#FF6B6B"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="spent"
            name="Total spent"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
