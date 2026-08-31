import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = '', type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const isPasswordType = type === 'password';
    const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    const renderRightIcon = () => {
      if (rightIcon) return rightIcon;
      if (isPasswordType) {
        return (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="text-slate-400 hover:text-slate-600 p-1 focus:outline-none transition-colors cursor-pointer"
            title={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4 text-pink-600" /> : <Eye className="w-4 h-4" />}
          </button>
        );
      }
      return null;
    };

    const effectiveRightIcon = renderRightIcon();

    return (
      <div className="w-full space-y-1.5">
        {label && <label className="block text-xs font-semibold text-slate-700">{label}</label>}
        <div className="relative flex items-center">
          {leftIcon && <div className="absolute left-3.5 text-slate-400 pointer-events-none">{leftIcon}</div>}
          <input
            ref={ref}
            type={inputType}
            className={`w-full bg-white border text-slate-900 placeholder-slate-400 text-sm rounded-xl px-4 py-2.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${
              leftIcon ? 'pl-10' : ''
            } ${effectiveRightIcon ? 'pr-10' : ''} ${
              error ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 hover:border-slate-300'
            } ${className}`}
            {...props}
          />
          {effectiveRightIcon && <div className="absolute right-3 text-slate-400 flex items-center">{effectiveRightIcon}</div>}
        </div>
        {error ? (
          <p className="text-xs text-rose-500">{error}</p>
        ) : (
          helperText && <p className="text-xs text-slate-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
