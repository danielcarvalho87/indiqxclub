import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Button } from "../ui/Button";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] bg-brand-surface shadow-[0_32px_120px_rgba(3,8,20,0.58)] animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-5">
          <div className="flex items-center space-x-3 text-rose-400">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-500/12">
              <AlertTriangle size={22} />
            </div>
            <h2 className="text-lg font-semibold text-brand-text">{title || "Confirmar Exclusão"}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/8 bg-white/[0.03] p-2 text-brand-muted transition-colors hover:text-brand-text"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-brand-muted text-base leading-relaxed">
            {message || "Tem certeza de que deseja realizar esta ação? Esta operação não poderá ser desfeita."}
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t border-brand-border bg-brand-surface/70 px-5 py-5">
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            variant="danger"
            size="sm"
          >
            <Trash2 size={18} />
            Excluir
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
