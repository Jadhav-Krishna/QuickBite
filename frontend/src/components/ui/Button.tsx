import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-ambient flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary-container)] text-white hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,90,95,0.4)]",
    secondary: "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] hover:bg-[var(--color-primary)]",
    outline: "border-2 border-[var(--color-outline-variant)] text-[var(--color-on-surface)] hover:border-[var(--color-primary)] bg-transparent",
    ghost: "bg-transparent text-[var(--color-on-surface)] hover:bg-[var(--color-surface-variant)] shadow-none"
  };

  const widthStyle = fullWidth ? "w-full" : "w-auto";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
