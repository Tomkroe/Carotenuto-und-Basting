export function DataTable({
  columns,
  children,
}: {
  columns: { key: string; header: string; className?: string }[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-text-muted">
            {columns.map((c) => (
              <th key={c.key} className={`whitespace-nowrap px-4 py-2.5 font-medium ${c.className ?? ""}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}
