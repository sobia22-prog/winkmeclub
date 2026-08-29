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
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-pink-300 transition-all shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5 min-w-0 flex-1">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-500 block leading-tight truncate">{title}</span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">{value}</div>
          {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">{subtitle}</p>}
        </div>
        {icon && (
          <div className="p-2.5 sm:p-3 bg-pink-50 border border-pink-100 rounded-2xl text-pink-600 shrink-0">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center">
          <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full shrink-0 ${trendUp ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};
