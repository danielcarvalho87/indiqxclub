import React from "react";
import { AlertTriangle, Clock, LogOut } from "lucide-react";
import { Button } from "../ui/Button";

const SessionTimeoutModal = ({ onRenew, onLogout }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[30px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] bg-brand-surface p-6 shadow-[0_32px_120px_rgba(3,8,20,0.58)] animate-in fade-in zoom-in duration-300">
        <div className="mb-4 flex items-center space-x-3 text-brand-primary">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/12">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-semibold text-brand-text">
            Sessão Expirando
          </h2>
        </div>

        <p className="text-brand-muted mb-6 text-base leading-relaxed">
          Sua sessão irá expirar em menos de 5 minutos por segurança. Para
          continuar utilizando o sistema, clique em{" "}
          <strong>Renovar Sessão</strong>.
        </p>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 justify-end pt-2">
          <Button onClick={onLogout} variant="outline" size="sm">
            <LogOut size={18} />
            Sair Agora
          </Button>
          <Button onClick={onRenew} size="sm">
            <Clock size={18} />
            Renovar Sessão
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutModal;
