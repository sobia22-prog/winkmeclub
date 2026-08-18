import React, { forwardRef } from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && <label className="block text-xs font-medium text-slate-300">{label}</label>}
        <textarea
          ref={ref}
          className={`w-full bg-brand-surface border text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-wine focus:border-brand-wine border-brand-border hover:border-slate-600 min-h-[100px] ${
            error ? 'border-rose-500' : ''
          } ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-rose-500">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
