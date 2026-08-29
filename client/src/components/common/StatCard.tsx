import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendUp = true,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-5 hover:border-pink-300 transition-all shadow-sm">
      <div className="flex items-start justify-between gap-1">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 leading-tight block">{title}</span>
        {icon && <div className="p-1.5 sm:p-2.5 bg-pink-50 border border-pink-100 rounded-xl text-pink-600 shrink-0">{icon}</div>}
      </div>
      <div className="mt-2.5 flex items-baseline justify-between gap-1">
        <div className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight truncate">{value}</div>
        {trend && (
          <span className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ${trendUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-1 text-[10px] sm:text-xs text-slate-500 truncate">{subtitle}</p>}
    </div>
  );
};
