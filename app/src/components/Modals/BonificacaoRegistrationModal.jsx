import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useAuth } from "../../hooks/useAuth";

const BonificacaoRegistrationModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) => {
  const { userId } = useAuth();
  const defaultFormState = {
    titulo: "",
    descricao: "",
    pontuacao: "",
    status: "Ativo",
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          ...defaultFormState,
          ...initialData,
        });
        setIsEditing(true);
      } else {
        setFormData(defaultFormState);
        setIsEditing(false);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Extrair apenas os campos permitidos pelo DTO
    const { titulo, descricao, pontuacao, status } = formData;

    const submissionData = {
      master_id: Number(userId),
      userId: Number(userId),
      titulo,
      descricao,
      pontuacao: parseInt(pontuacao) || 0,
      status,
    };
    onSubmit(submissionData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,rgba(76,130,255,0.18),transparent_35%),rgba(2,6,16,0.86)] p-4 backdrop-blur-md">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[32px] border border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] bg-brand-surface shadow-[0_32px_120px_rgba(3,8,20,0.58)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-brand-border/40 bg-brand-surface px-6 py-5">
          <div>
            <h2 className="text-2xl font-semibold text-brand-text">
              {isEditing ? "Editar Bonificação" : "Nova Bonificação"}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Defina as regras da bonificação seguindo o novo padrão visual.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/5 bg-white/[0.02] p-2 text-brand-muted transition-colors hover:bg-brand-surfaceAlt hover:text-brand-text"
          >
            <X size={24} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 overflow-y-auto p-6 custom-scrollbar"
        >
          <div className="rounded-[28px] border border-white/5 bg-brand-surfaceAlt/30 p-5 md:p-6">
            <div className="mb-5">
              <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-primary/90">
                Regras da bonificação
              </h3>
            </div>
            <div className="space-y-6">
              <Input
                label="Título"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                required
                placeholder="Ex: Venda de Imóvel"
              />

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-brand-muted">
                  Descrição
                </label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-brand-text shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 focus:border-brand-primary/45 focus:bg-brand-dark/60 focus:outline-none focus:ring-4 focus:ring-brand-primary/12"
                  placeholder="Descrição da bonificação..."
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Input
                  label="Pontuação"
                  name="pontuacao"
                  type="number"
                  value={formData.pontuacao}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 100"
                />

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-brand-muted">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-brand-text shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 focus:border-brand-primary/45 focus:bg-brand-dark/60 focus:outline-none focus:ring-4 focus:ring-brand-primary/12"
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-brand-border/40 pt-6">
            <Button type="button" onClick={onClose} variant="outline" size="sm">
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              <Save size={18} />
              {isEditing ? "Salvar Alterações" : "Criar Bonificação"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BonificacaoRegistrationModal;
