import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="font-sans text-sm font-medium text-[var(--color-on-surface-variant)] block">
          {label}
        </label>
      )}
      <input 
        className={`w-full bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/20 transition-all ${
          error ? 'border border-[var(--color-error)]' : 'border border-transparent'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-[var(--color-error)] text-sm mt-1">{error}</p>
      )}
    </div>
  );
}
