import React from "react";

export const Card = ({ children, className = "", title, ...props }) => {
  return (
    <div
      className={`bg-brand-surface/88 backdrop-blur-xl rounded-[28px] p-5 md:p-8 border border-white/5 shadow-[0_24px_60px_rgba(7,12,24,0.28)] ${className}`}
      {...props}
    >
      {title && (
        <h3 className="text-xl font-semibold text-brand-text mb-6 tracking-tight">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
