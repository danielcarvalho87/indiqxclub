import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useModalDismiss } from "../../hooks/useModalDismiss";

/**
 * Cadastro e edição de um plano do catálogo.
 *
 * "Limite de parceiros" vazio significa ilimitado, e é assim que o
 * Enterprise é representado — no banco a coluna fica NULL.
 */

const estadoInicial = {
  slug: "",
  nome: "",
  limiteParceiros: "",
  precoMensal: "",
  precoAnual: "",
  precoParceiroExtra: "",
  descricao: "",
  destaque: false,
  ativo: true,
  ordem: 0,
};

const PlanoModal = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState(estadoInicial);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);
  const { backdropRef, onBackdropMouseDown, onBackdropClick } = useModalDismiss(
    isOpen,
    onClose,
  );

  useEffect(() => {
    if (!isOpen) return;

    setErros({});
    setFormData(
      initialData
        ? {
            slug: initialData.slug || "",
            nome: initialData.nome || "",
            limiteParceiros:
              initialData.limiteParceiros === null ||
              initialData.limiteParceiros === undefined
                ? ""
                : String(initialData.limiteParceiros),
            precoMensal: String(initialData.precoMensal ?? ""),
            precoAnual: String(initialData.precoAnual ?? ""),
            precoParceiroExtra:
              initialData.precoParceiroExtra === null ||
              initialData.precoParceiroExtra === undefined
                ? ""
                : String(initialData.precoParceiroExtra),
            descricao: initialData.descricao || "",
            destaque: !!initialData.destaque,
            ativo: initialData.ativo !== false,
            ordem: initialData.ordem ?? 0,
          }
        : estadoInicial,
    );
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validar = () => {
    const novos = {};

    if (!formData.nome.trim()) novos.nome = "Informe o nome do plano.";
    if (!/^[a-z0-9-]{2,40}$/.test(formData.slug.trim().toLowerCase())) {
      novos.slug = "Use apenas letras minúsculas, números e hífen.";
    }
    if (formData.precoMensal === "" || Number(formData.precoMensal) < 0) {
      novos.precoMensal = "Informe um valor mensal válido.";
    }
    if (formData.precoAnual === "" || Number(formData.precoAnual) < 0) {
      novos.precoAnual = "Informe um valor anual válido.";
    }
    if (formData.limiteParceiros !== "" && Number(formData.limiteParceiros) < 0) {
      novos.limiteParceiros = "O limite não pode ser negativo.";
    }

    setErros(novos);
    return Object.keys(novos).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    setSalvando(true);
    try {
      await onSubmit({
        slug: formData.slug.trim().toLowerCase(),
        nome: formData.nome.trim(),
        limiteParceiros:
          formData.limiteParceiros === ""
            ? null
            : Number(formData.limiteParceiros),
        precoMensal: Number(formData.precoMensal),
        precoAnual: Number(formData.precoAnual),
        precoParceiroExtra:
          formData.precoParceiroExtra === ""
            ? null
            : Number(formData.precoParceiroExtra),
        descricao: formData.descricao.trim(),
        destaque: formData.destaque,
        ativo: formData.ativo,
        ordem: Number(formData.ordem) || 0,
      });
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div
      ref={backdropRef}
      onMouseDown={onBackdropMouseDown}
      onClick={onBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] border border-white/5 bg-brand-surface p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-brand-text">
            {initialData ? "Editar plano" : "Novo plano"}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Nome *"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              error={erros.nome}
              placeholder="Growth"
            />
            <Input
              label="Identificador *"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              error={erros.slug}
              placeholder="growth"
            />
            <Input
              label="Limite de parceiros (vazio = ilimitado)"
              name="limiteParceiros"
              type="number"
              min="0"
              value={formData.limiteParceiros}
              onChange={handleChange}
              error={erros.limiteParceiros}
              placeholder="30"
            />
            <Input
              label="Ordem na tabela"
              name="ordem"
              type="number"
              min="0"
              value={formData.ordem}
              onChange={handleChange}
            />
            <Input
              label="Valor mensal (R$) *"
              name="precoMensal"
              type="number"
              step="0.01"
              min="0"
              value={formData.precoMensal}
              onChange={handleChange}
              error={erros.precoMensal}
            />
            <Input
              label="Valor anual (R$) *"
              name="precoAnual"
              type="number"
              step="0.01"
              min="0"
              value={formData.precoAnual}
              onChange={handleChange}
              error={erros.precoAnual}
            />
            <Input
              label="Parceiro extra (R$)"
              name="precoParceiroExtra"
              type="number"
              step="0.01"
              min="0"
              value={formData.precoParceiroExtra}
              onChange={handleChange}
              placeholder="14"
            />
            <Input
              label="Descrição"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="O mais escolhido"
            />
          </div>

          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm text-brand-muted">
              <input
                type="checkbox"
                name="destaque"
                checked={formData.destaque}
                onChange={handleChange}
                className="h-4 w-4 accent-brand-primary"
              />
              Destacar na tabela
            </label>
            <label className="flex items-center gap-2 text-sm text-brand-muted">
              <input
                type="checkbox"
                name="ativo"
                checked={formData.ativo}
                onChange={handleChange}
                className="h-4 w-4 accent-brand-primary"
              />
              Disponível para contratação
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/5 pt-5">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar plano"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanoModal;
