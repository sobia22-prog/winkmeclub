import React from 'react';
import { Crown, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

interface BadgeProps {
  variant?: 'vip' | 'verified' | 'pending' | 'success' | 'danger' | 'warning' | 'neutral';
  children?: React.ReactNode;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (variant === 'vip') {
    return (
      <span className={`inline-flex items-center gap-1 font-extrabold rounded-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-600/20 border border-amber-500/40 text-amber-400 ${sizeClasses}`}>
        <Crown className="w-3 h-3 text-amber-400 fill-amber-400" />
        <span>{children || 'VIP CLUB'}</span>
      </span>
    );
  }

  if (variant === 'verified') {
    return (
      <span className={`inline-flex items-center gap-1 font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 ${sizeClasses}`}>
        <CheckCircle2 className="w-3 h-3" />
        <span>{children || 'VERIFIED'}</span>
      </span>
    );
  }

  const variants = {
    pending: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    danger: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    neutral: 'bg-slate-800 border-slate-700 text-slate-300',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${variants[variant]} ${sizeClasses}`}>
      {children}
    </span>
  );
};
