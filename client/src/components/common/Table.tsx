import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-brand-border bg-brand-surface">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-brand-border bg-brand-card">
            {headers.map((h, i) => (
              <th key={i} className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-border/60 text-slate-200">{children}</tbody>
      </table>
    </div>
  );
};
