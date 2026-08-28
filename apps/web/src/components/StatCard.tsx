type StatCardTone = "default" | "warning" | "danger" | "success";

const TONE_BORDER: Record<StatCardTone, string> = {
  default: "border-border",
  warning: "border-amber-500/60",
  danger: "border-red-500/60",
  success: "border-emerald-500/60",
};

const TONE_TEXT: Record<StatCardTone, string> = {
  default: "text-text",
  warning: "text-amber-500",
  danger: "text-red-500",
  success: "text-emerald-500",
};

export function StatCard({
  value,
  label,
  tone = "default",
}: {
  value: string | number;
  label: string;
  tone?: StatCardTone;
}) {
  return (
    <div className={`rounded-lg border-l-4 border border-border bg-surface px-4 py-3 ${TONE_BORDER[tone]}`}>
      <p className={`text-2xl font-semibold ${TONE_TEXT[tone]}`}>{value}</p>
      <p className="text-sm text-text-muted">{label}</p>
    </div>
  );
}
