import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Controle de paginação das listagens.
 * Mostra uma janela de páginas ao redor da atual para não estourar a largura
 * quando houver muitas páginas.
 */
export const Pagination = ({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  label = "registros",
}) => {
  if (!totalPages || totalPages <= 1) {
    return total > 0 ? (
      <p className="mt-4 text-sm text-brand-muted">
        {total} {label}
      </p>
    ) : null;
  }

  const janela = 2;
  const inicio = Math.max(1, page - janela);
  const fim = Math.min(totalPages, page + janela);
  const paginas = [];
  for (let i = inicio; i <= fim; i += 1) paginas.push(i);

  const primeiroDaPagina = (page - 1) * limit + 1;
  const ultimoDaPagina = Math.min(page * limit, total);

  return (
    <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-brand-border pt-4 md:flex-row">
      <p className="text-sm text-brand-muted">
        Mostrando <strong className="text-brand-text">{primeiroDaPagina}</strong>
        –<strong className="text-brand-text">{ultimoDaPagina}</strong> de{" "}
        <strong className="text-brand-text">{total}</strong> {label}
      </p>

      <nav className="flex items-center gap-1" aria-label="Paginação">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={18} />
        </button>

        {inicio > 1 && (
          <>
            <button
              type="button"
              onClick={() => onPageChange(1)}
              className="h-9 min-w-[36px] rounded-xl px-2 text-sm text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            >
              1
            </button>
            {inicio > 2 && (
              <span className="px-1 text-brand-muted">…</span>
            )}
          </>
        )}

        {paginas.map((numero) => (
          <button
            key={numero}
            type="button"
            onClick={() => onPageChange(numero)}
            aria-current={numero === page ? "page" : undefined}
            className={`h-9 min-w-[36px] rounded-xl px-2 text-sm font-medium transition-colors ${
              numero === page
                ? "bg-brand-primary text-white"
                : "text-brand-muted hover:bg-white/5 hover:text-brand-text"
            }`}
          >
            {numero}
          </button>
        ))}

        {fim < totalPages && (
          <>
            {fim < totalPages - 1 && (
              <span className="px-1 text-brand-muted">…</span>
            )}
            <button
              type="button"
              onClick={() => onPageChange(totalPages)}
              className="h-9 min-w-[36px] rounded-xl px-2 text-sm text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Próxima página"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-border text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={18} />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
