"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type CashflowMonth = {
  month: string;
  einnahmen: number;
  ausgaben: number;
  ueberschuss: number;
};

function formatEuro(value: number) {
  return `${value.toLocaleString("de-DE", { maximumFractionDigits: 0 })} €`;
}

function CashflowTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-medium text-text">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="flex items-center gap-1.5 text-text-muted">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-medium text-text">{formatEuro(p.value)}</span>
        </p>
      ))}
    </div>
  );
}

export function CashflowChart({ data }: { data: CashflowMonth[] }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <h2 className="mb-3 text-sm font-semibold text-text">Mieteinnahmen-Verlauf</h2>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={2}>
          <CartesianGrid vertical={false} className="stroke-border" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} className="fill-text-muted" axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12 }}
            className="fill-text-muted"
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => formatEuro(v)}
            width={80}
          />
          <Tooltip content={<CashflowTooltip />} cursor={{ fill: "rgb(var(--color-border) / 0.3)" }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="einnahmen" name="Einnahmen" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Bar dataKey="ausgaben" name="Ausgaben" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          <Line
            type="monotone"
            dataKey="ueberschuss"
            name="Überschuss"
            stroke="var(--color-chart-3)"
            strokeWidth={2}
            dot={{ r: 3 }}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
