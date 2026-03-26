import React from "react";

const variants = {
  primary:
    "bg-brand-primary text-white hover:bg-brand-secondary transition-colors duration-200",
  outline:
    "border border-brand-primary text-brand-text hover:bg-brand-primary hover:text-brand-dark transition-colors duration-200",
  ghost:
    "bg-transparent text-brand-muted hover:bg-brand-surfaceAlt hover:text-brand-text transition-colors duration-200",
  danger:
    "bg-red-500 text-white hover:bg-red-600 transition-colors duration-200",
  "ghost-danger":
    "bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200",
};

const sizes = {
  sm: "px-4 py-2.5 text-sm",
  md: "px-6 py-3",
  lg: "px-7 py-3.5 text-base",
};

export const Button = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
