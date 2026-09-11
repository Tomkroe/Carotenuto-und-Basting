export function MobileCardList({ children }: { children: React.ReactNode }) {
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-surface md:hidden">
      {children}
    </div>
  );
}
