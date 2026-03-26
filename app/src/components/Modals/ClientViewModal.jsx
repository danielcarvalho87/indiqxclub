import React from "react";
import {
  X,
  Phone,
  Mail,
  User,
  Briefcase,
  DollarSign,
  Calendar,
} from "lucide-react";
import { Button } from "../ui/Button";

const ClientViewModal = ({ isOpen, onClose, cliente }) => {
  if (!isOpen || !cliente) return null;

  const formatCurrency = (val) => {
    if (val === null || val === undefined) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  const cleanPhone = cliente.telefone
    ? cliente.telefone.replace(/\D/g, "")
    : "";
  const whatsappLink = cleanPhone ? `https://wa.me/55${cleanPhone}` : "#";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(76,130,255,0.18),transparent_35%),rgba(2,6,16,0.86)] p-4 backdrop-blur-md">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] bg-brand-surface shadow-[0_32px_120px_rgba(3,8,20,0.58)] animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between border-b border-brand-border/40 px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-brand-text">
              Detalhes do Cliente
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Visualize todas as informações do cliente cadastrado.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/5 bg-white/[0.02] p-2 text-brand-muted transition-colors hover:bg-brand-surfaceAlt hover:text-brand-text"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="mb-8 flex items-center gap-6 rounded-[28px] border border-white/5 bg-brand-surfaceAlt/30 p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-brand-primary/30 to-brand-secondary/20 text-2xl font-bold text-white">
              {cliente.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-brand-text">
                {cliente.nome} {cliente.sobrenome}
              </h3>
              <span
                className={`inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  cliente.status === "Novo cliente"
                    ? "bg-blue-900/30 text-blue-400 border border-blue-900/50"
                    : cliente.status === "Em atendimento"
                      ? "bg-yellow-900/30 text-yellow-400 border border-yellow-900/50"
                      : cliente.status === "Reunião agendada"
                        ? "bg-purple-900/30 text-purple-400 border border-purple-900/50"
                        : cliente.status === "Contrato fechado"
                          ? "bg-green-900/30 text-green-400 border border-green-900/50"
                          : cliente.status === "Contrato perdido"
                            ? "bg-red-900/30 text-red-400 border border-red-900/50"
                            : "bg-brand-surface/30 text-brand-muted border border-brand-border"
                }`}
              >
                {cliente.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6 rounded-[28px] border border-white/5 bg-brand-surfaceAlt/30 p-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-primary">
                <User size={16} /> Contato
              </h4>

              <div>
                <p className="text-brand-muted text-sm mb-1">
                  Telefone / WhatsApp
                </p>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-brand-muted" />
                  {cliente.telefone ? (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-brand-text hover:text-brand-primary transition-colors font-medium"
                    >
                      {cliente.telefone}
                    </a>
                  ) : (
                    <span className="text-brand-muted font-medium">-</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-brand-muted text-sm mb-1">Email</p>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-brand-muted" />
                  <span className="text-brand-text font-medium break-all">
                    {cliente.email || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6 rounded-[28px] border border-white/5 bg-brand-surfaceAlt/30 p-5">
              <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-brand-primary">
                <Briefcase size={16} /> Serviço
              </h4>

              <div>
                <p className="text-brand-muted text-sm mb-1">
                  Parceiro Responsável
                </p>
                <div className="flex items-center gap-2">
                  <User size={16} className="text-brand-muted" />
                  <span className="text-brand-text font-medium">
                    {cliente.corretor
                      ? `${cliente.corretor.name} ${cliente.corretor.sobrenome || ""}`
                      : "-"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-brand-muted text-sm mb-1">Tipo de Serviço</p>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-brand-muted" />
                  <span className="text-brand-text font-medium">
                    {cliente.tipo_servico || "-"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-brand-muted text-sm mb-1">
                  Valor do Contrato
                </p>
                <div className="flex items-center gap-2">
                  <DollarSign size={16} className="text-brand-muted" />
                  <span className="text-brand-text font-medium text-lg">
                    {formatCurrency(cliente.valor_contrato)}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-brand-muted text-sm mb-1">
                  Data de Cadastro
                </p>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-brand-muted" />
                  <span className="text-brand-text font-medium text-sm">
                    {cliente.created_at
                      ? new Date(cliente.created_at).toLocaleDateString(
                          "pt-BR",
                          {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          },
                        )
                      : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t border-brand-border/40 bg-brand-surface/70 p-6">
          <Button onClick={onClose} variant="outline" size="sm">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientViewModal;
