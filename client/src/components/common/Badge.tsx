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
      <span className={`inline-flex items-center gap-1 font-extrabold rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm ${sizeClasses}`}>
        <Crown className="w-3 h-3 text-yellow-300 fill-yellow-300" />
        <span>{children || 'VIP CLUB'}</span>
      </span>
    );
  }

  if (variant === 'verified') {
    return (
      <span className={`inline-flex items-center gap-1 font-bold rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 ${sizeClasses}`}>
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>{children || 'VERIFIED'}</span>
      </span>
    );
  }

  const variants = {
    pending: 'bg-pink-50 border-pink-200 text-pink-700 font-bold',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold',
    danger: 'bg-rose-50 border-rose-200 text-rose-700 font-bold',
    warning: 'bg-pink-50 border-pink-200 text-pink-700 font-bold',
    neutral: 'bg-slate-100 border-slate-200 text-slate-700 font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${variants[variant]} ${sizeClasses}`}>
      {children}
    </span>
  );
};
