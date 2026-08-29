export function ProgressRing({
  percent,
  value,
  label,
  caption,
}: {
  percent: number;
  value: string;
  label: string;
  caption?: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="rounded-lg border border-border bg-surface px-4 py-3">
      <div className="flex items-center gap-4">
        <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90 shrink-0">
          <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="6" className="stroke-border" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ stroke: "var(--color-chart-1)" }}
          />
        </svg>
        <div>
          <p className="text-xl font-semibold text-text">{value}</p>
          <p className="text-sm text-text-muted">{label}</p>
        </div>
      </div>
      {caption && <p className="mt-2 text-xs font-medium text-primary">{caption}</p>}
    </div>
  );
}
