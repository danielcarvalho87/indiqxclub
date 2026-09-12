import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useModalDismiss } from "../../hooks/useModalDismiss";
import { formatarMoeda } from "../../utils/pontos";

/**
 * Vincula um plano a um administrador.
 *
 * O valor é sugerido pelo plano e pelo ciclo, mas continua editável para o
 * caso negociado (Enterprise). O vencimento em branco deixa a API calcular
 * a partir do ciclo.
 */

const selectStyle =
  "w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-brand-text focus:border-brand-primary/45 focus:outline-none focus:ring-4 focus:ring-brand-primary/12";

const AssinaturaModal = ({
  isOpen,
  onClose,
  onSubmit,
  planos,
  administrador,
  assinaturaAtual,
}) => {
  const [planoId, setPlanoId] = useState("");
  const [ciclo, setCiclo] = useState("mensal");
  const [inicio, setInicio] = useState("");
  const [expiraEm, setExpiraEm] = useState("");
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");
  const [valorEditado, setValorEditado] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const { backdropRef, onBackdropMouseDown, onBackdropClick } = useModalDismiss(
    isOpen,
    onClose,
  );

  const planoSelecionado = useMemo(
    () => planos.find((plano) => String(plano.id) === String(planoId)),
    [planos, planoId],
  );

  useEffect(() => {
    if (!isOpen) return;

    setPlanoId(assinaturaAtual?.planoId ? String(assinaturaAtual.planoId) : "");
    setCiclo(assinaturaAtual?.ciclo || "mensal");
    setInicio(assinaturaAtual?.inicio || new Date().toISOString().slice(0, 10));
    setExpiraEm(assinaturaAtual?.expiraEm || "");
    setValor(assinaturaAtual?.valor != null ? String(assinaturaAtual.valor) : "");
    setObservacao(assinaturaAtual?.observacao || "");
    setValorEditado(Boolean(assinaturaAtual));
  }, [isOpen, assinaturaAtual]);

  // Enquanto o FullAdmin não digitar um valor próprio, o campo acompanha o
  // preço de tabela do plano e do ciclo escolhidos.
  useEffect(() => {
    if (!isOpen || valorEditado || !planoSelecionado) return;

    setValor(
      String(
        ciclo === "anual"
          ? planoSelecionado.precoAnual
          : planoSelecionado.precoMensal,
      ),
    );
  }, [isOpen, valorEditado, planoSelecionado, ciclo]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!planoId) return;

    setSalvando(true);
    try {
      await onSubmit({
        userId: administrador.id,
        planoId: Number(planoId),
        ciclo,
        inicio: inicio || undefined,
        expiraEm: expiraEm || undefined,
        valor: valor === "" ? undefined : Number(valor),
        observacao: observacao.trim() || undefined,
      });
    } finally {
      setSalvando(false);
    }
  };

  const nomeAdmin = [administrador?.name, administrador?.sobrenome]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      ref={backdropRef}
      onMouseDown={onBackdropMouseDown}
      onClick={onBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] border border-white/5 bg-brand-surface p-6 shadow-2xl">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">
              Vincular plano
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              {nomeAdmin} · {administrador?.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-muted">
              Plano *
            </label>
            <select
              value={planoId}
              onChange={(e) => setPlanoId(e.target.value)}
              className={selectStyle}
              required
            >
              <option value="">Selecione um plano</option>
              {planos.map((plano) => (
                <option key={plano.id} value={plano.id}>
                  {plano.nome} ·{" "}
                  {plano.limiteParceiros === null
                    ? "parceiros ilimitados"
                    : `até ${plano.limiteParceiros} parceiros`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-brand-muted">
              Ciclo de cobrança
            </label>
            <select
              value={ciclo}
              onChange={(e) => setCiclo(e.target.value)}
              className={selectStyle}
            >
              <option value="mensal">Mensal</option>
              <option value="anual">Anual</option>
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Início da vigência"
              type="date"
              value={inicio}
              onChange={(e) => setInicio(e.target.value)}
            />
            <Input
              label="Vencimento (vazio = pelo ciclo)"
              type="date"
              value={expiraEm}
              onChange={(e) => setExpiraEm(e.target.value)}
            />
          </div>

          <Input
            label="Valor cobrado (R$)"
            type="number"
            step="0.01"
            min="0"
            value={valor}
            onChange={(e) => {
              setValorEditado(true);
              setValor(e.target.value);
            }}
          />

          <Input
            label="Observação"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Condição negociada, desconto, etc."
          />

          {planoSelecionado && (
            <p className="rounded-2xl bg-white/[0.03] px-4 py-3 text-sm text-brand-muted">
              Tabela: {formatarMoeda(planoSelecionado.precoMensal)} por mês ou{" "}
              {formatarMoeda(planoSelecionado.precoAnual)} por ano.
              {planoSelecionado.precoParceiroExtra
                ? ` Parceiro extra ${formatarMoeda(planoSelecionado.precoParceiroExtra)}.`
                : ""}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-white/5 pt-5">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando || !planoId}>
              {salvando ? "Salvando..." : "Vincular plano"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssinaturaModal;
