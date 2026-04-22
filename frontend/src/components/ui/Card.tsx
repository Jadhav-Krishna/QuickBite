import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div 
      className={`bg-[var(--color-surface-container-lowest)] rounded-[2rem] shadow-ambient p-6 md:p-8 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return <div className={`mb-6 ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: CardProps) {
  return <h3 className={`font-serif text-2xl font-bold text-[var(--color-on-surface)] ${className}`}>{children}</h3>;
}
