import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hoverEffect = false, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-brand-surface border border-brand-border rounded-2xl p-6 transition-all duration-300 ${
        hoverEffect ? 'hover:border-slate-600 hover:shadow-xl hover:shadow-brand-wine/5 hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
