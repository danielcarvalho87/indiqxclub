import React, { useId } from "react";

/**
 * Campo de texto padrão.
 * `error` destaca a borda e mostra a mensagem abaixo do campo — antes os
 * erros de validação só apareciam num toast que sumia em 3 segundos, sem
 * indicar qual campo precisava de correção.
 */
export const Input = ({ label, className = "", error, id, ...props }) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-brand-muted">
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-2xl border bg-white/[0.03] px-4 py-3 text-brand-text placeholder-brand-muted/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 focus:bg-brand-dark/60 focus:outline-none focus:ring-4 ${
          error
            ? "border-rose-500/60 focus:border-rose-500 focus:ring-rose-500/15"
            : "border-white/8 focus:border-brand-primary/45 focus:ring-brand-primary/12"
        } ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-xs text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
