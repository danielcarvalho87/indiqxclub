import React from 'react';

export const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-brand-text placeholder-brand-muted/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 focus:border-brand-primary/45 focus:bg-brand-dark/60 focus:outline-none focus:ring-4 focus:ring-brand-primary/12 ${className}`}
      {...props}
    />
  );
};
