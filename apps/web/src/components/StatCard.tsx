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
  primaryLabel,
  secondaryValue,
  secondaryLabel,
  onClick,
}: {
  value: string | number;
  label: string;
  tone?: StatCardTone;
  /** Suffix under the primary number when secondaryValue is set, e.g. "Vorgänge". */
  primaryLabel?: string;
  secondaryValue?: string | number;
  secondaryLabel?: string;
  onClick?: () => void;
}) {
  const Wrapper = onClick ? "button" : "div";

  return (
    <Wrapper
      onClick={onClick}
      className={`w-full rounded-lg border-l-4 border border-border bg-surface px-4 py-3 text-left ${TONE_BORDER[tone]} ${
        onClick ? "cursor-pointer transition hover:bg-bg" : ""
      }`}
    >
      {secondaryValue === undefined ? (
        <>
          <p className={`text-2xl font-semibold ${TONE_TEXT[tone]}`}>{value}</p>
          <p className="text-sm text-text-muted">{label}</p>
        </>
      ) : (
        <>
          <p className="mb-0.5 text-sm text-text-muted">{label}</p>
          <p className="flex items-baseline gap-4">
            <span>
              <span className={`text-2xl font-semibold ${TONE_TEXT[tone]}`}>{value}</span>
              <span className="ml-1 text-xs text-text-muted">/{primaryLabel}</span>
            </span>
            <span>
              <span className="text-2xl font-semibold text-text-muted">{secondaryValue}</span>
              <span className="ml-1 text-xs text-text-muted">/{secondaryLabel}</span>
            </span>
          </p>
        </>
      )}
    </Wrapper>
  );
}
