import React from 'react';

interface TableProps {
  headers: string[];
  children: React.ReactNode;
}

export const Table: React.FC<TableProps> = ({ headers, children }) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-pink-50/50">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2.5 sm:px-5 sm:py-3.5 text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-800">{children}</tbody>
      </table>
    </div>
  );
};
