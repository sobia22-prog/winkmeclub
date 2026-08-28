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
      className={`bg-brand-surface border border-brand-border rounded-2xl p-6 transition-all duration-300 shadow-sm ${
        hoverEffect ? 'hover:border-pink-300 hover:shadow-md hover:shadow-pink-500/5 hover:-translate-y-0.5' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
