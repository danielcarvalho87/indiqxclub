import React, { useEffect, useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useModalDismiss } from "../../hooks/useModalDismiss";

/**
 * Confirmação de ação destrutiva.
 *
 * `confirmationText` liga a confirmação forte: o usuário precisa digitar o
 * texto exato para liberar o botão. Usado onde a exclusão leva junto dados
 * relacionados (excluir um parceiro remove o histórico de indicações dele).
 */
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  warning,
  confirmationText,
  confirmLabel = "Excluir",
}) => {
  const [digitado, setDigitado] = useState("");
  const [confirmando, setConfirmando] = useState(false);
  const { backdropRef, onBackdropMouseDown, onBackdropClick } = useModalDismiss(
    isOpen,
    onClose,
  );

  useEffect(() => {
    if (isOpen) setDigitado("");
  }, [isOpen]);

  if (!isOpen) return null;

  const exigeTexto = Boolean(confirmationText);
  const textoConfere =
    !exigeTexto ||
    digitado.trim().toLowerCase() === confirmationText.trim().toLowerCase();

  const handleConfirm = async () => {
    if (!textoConfere || confirmando) return;
    setConfirmando(true);
    try {
      await onConfirm();
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      onMouseDown={onBackdropMouseDown}
      onClick={onBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={title || "Confirmar exclusão"}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] bg-brand-surface shadow-[0_32px_120px_rgba(3,8,20,0.58)] animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-5">
          <div className="flex items-center space-x-3 text-rose-400">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/12">
              <AlertTriangle size={22} />
            </div>
            <h2 className="text-lg font-semibold text-brand-text">
              {title || "Confirmar Exclusão"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="rounded-full border border-white/8 bg-white/[0.03] p-2 text-brand-muted transition-colors hover:text-brand-text"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-brand-muted text-base leading-relaxed">
            {message ||
              "Tem certeza de que deseja realizar esta ação? Esta operação não poderá ser desfeita."}
          </p>

          {warning && (
            <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
              {warning}
            </div>
          )}

          {exigeTexto && (
            <div className="space-y-2">
              <p className="text-sm text-brand-muted">
                Para confirmar, digite{" "}
                <strong className="text-brand-text">{confirmationText}</strong>:
              </p>
              <Input
                value={digitado}
                onChange={(e) => setDigitado(e.target.value)}
                placeholder={confirmationText}
                autoFocus
                aria-label="Texto de confirmação"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-brand-border bg-brand-surface/70 px-5 py-5">
          <Button onClick={onClose} variant="outline" size="sm">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            variant="danger"
            size="sm"
            disabled={!textoConfere || confirmando}
          >
            <Trash2 size={18} />
            {confirmando ? "Excluindo..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
