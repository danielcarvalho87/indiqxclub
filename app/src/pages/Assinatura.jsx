import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Users,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import {
  GET_MEU_HISTORICO_ASSINATURAS,
  GET_MINHA_ASSINATURA,
} from "../api";
import { apiFetch, mensagemDeErro } from "../lib/http";
import { formatarMoeda } from "../utils/pontos";

/**
 * Assinatura da empresa, na visão do administrador.
 * Somente leitura: contratação e troca de plano são feitas pelo FullAdmin.
 */

function formatarData(valor) {
  if (!valor) return "—";
  const data = new Date(`${String(valor).slice(0, 10)}T00:00:00`);
  return Number.isNaN(data.getTime()) ? "—" : data.toLocaleDateString("pt-BR");
}

const Assinatura = () => {
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState(null);
  const [historico, setHistorico] = useState([]);

  const carregar = useCallback(async () => {
    const token = window.localStorage.getItem("token");
    setLoading(true);

    try {
      const { url, options } = GET_MINHA_ASSINATURA(token);
      const { url: urlHist, options: optHist } =
        GET_MEU_HISTORICO_ASSINATURAS(token);

      const [response, resHist] = await Promise.all([
        apiFetch(url, options),
        apiFetch(urlHist, optHist),
      ]);

      if (!response.ok) {
        toast.error(
          await mensagemDeErro(response, "Erro ao carregar a assinatura."),
        );
        return;
      }

      setResumo(await response.json());
      if (resHist.ok) setHistorico(await resHist.json());
    } catch (error) {
      console.error("Erro ao carregar assinatura:", error);
      toast.error("Erro ao carregar a assinatura.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando assinatura..." />;
  }

  const plano = resumo?.plano;
  const assinatura = resumo?.assinatura;
  const uso = resumo?.uso;
  const ilimitado = uso?.limite === null || uso?.limite === undefined;
  const percentual = ilimitado ? 0 : Math.min(100, uso?.percentual ?? 0);
  const noLimite = !ilimitado && uso?.disponivel === 0;

  return (
    <div className="space-y-6 p-3 md:p-4">
      <div>
        <h1 className="flex items-center gap-2 text-3xl font-bold text-brand-text">
          <CreditCard className="text-brand-primary" /> Minha assinatura
        </h1>
        <p className="mt-1 text-brand-muted">
          Plano contratado, vigência e uso da sua equipe de parceiros.
        </p>
      </div>

      {!plano && (
        <Card>
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertTriangle size={40} className="text-amber-400" />
            <p className="text-lg font-semibold text-brand-text">
              Nenhum plano vinculado
            </p>
            <p className="max-w-md text-sm text-brand-muted">
              Sua conta ainda não tem plano de assinatura. Fale com o
              administrador da plataforma para contratar.
            </p>
            <p className="text-sm text-brand-muted">
              Parceiros ativos hoje: {uso?.parceirosAtivos ?? 0}
            </p>
          </div>
        </Card>
      )}

      {plano && (
        <>
          {resumo.vencida && (
            <div className="flex items-start gap-3 rounded-[24px] border border-red-500/30 bg-red-500/10 p-4">
              <AlertTriangle size={20} className="mt-0.5 shrink-0 text-red-400" />
              <p className="text-sm text-brand-text">
                Sua assinatura venceu em {formatarData(assinatura.expiraEm)}.
                Procure o administrador da plataforma para renovar.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-brand-muted">
                    Plano atual
                  </p>
                  <h2 className="mt-1 flex items-center gap-2 text-2xl font-bold text-brand-text">
                    {plano.nome}
                    <BadgeCheck size={20} className="text-brand-primary" />
                  </h2>
                  {plano.descricao && (
                    <p className="mt-1 text-sm text-brand-muted">
                      {plano.descricao}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-text">
                    {formatarMoeda(assinatura.valor)}
                  </p>
                  <p className="text-sm capitalize text-brand-muted">
                    cobrança {assinatura.ciclo}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 border-t border-white/5 pt-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-brand-muted">
                    Início
                  </p>
                  <p className="mt-1 text-brand-text">
                    {formatarData(assinatura.inicio)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-brand-muted">
                    Vencimento
                  </p>
                  <p
                    className={`mt-1 ${resumo.vencida ? "text-red-400" : "text-brand-text"}`}
                  >
                    {formatarData(assinatura.expiraEm)}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-brand-muted">
                    Parceiro extra
                  </p>
                  <p className="mt-1 text-brand-text">
                    {plano.precoParceiroExtra
                      ? `${formatarMoeda(plano.precoParceiroExtra)} cada`
                      : "não se aplica"}
                  </p>
                </div>
              </div>

              {resumo.dias_restantes !== null && !resumo.vencida && (
                <p className="mt-5 flex items-center gap-2 text-sm text-brand-muted">
                  <CalendarClock size={16} />
                  Renova em {resumo.dias_restantes} dia
                  {resumo.dias_restantes === 1 ? "" : "s"}.
                </p>
              )}
            </Card>

            <Card>
              <p className="text-xs uppercase tracking-wide text-brand-muted">
                Parceiros ativos
              </p>
              <p className="mt-2 flex items-baseline gap-2 text-3xl font-bold text-brand-text">
                {uso.parceirosAtivos}
                <span className="text-base font-medium text-brand-muted">
                  / {ilimitado ? "ilimitado" : uso.limite}
                </span>
              </p>

              {!ilimitado && (
                <>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/5">
                    <div
                      className={`h-full rounded-full transition-all ${
                        noLimite
                          ? "bg-red-500"
                          : percentual >= 80
                            ? "bg-amber-400"
                            : "bg-brand-primary"
                      }`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                  <p className="mt-3 flex items-center gap-1.5 text-sm text-brand-muted">
                    <Users size={14} />
                    {noLimite
                      ? "Limite atingido: ative um plano maior para incluir mais parceiros."
                      : `${uso.disponivel} vaga${uso.disponivel === 1 ? "" : "s"} disponível${uso.disponivel === 1 ? "" : "eis"}.`}
                  </p>
                </>
              )}

              {ilimitado && (
                <p className="mt-4 text-sm text-brand-muted">
                  Seu plano não tem teto de parceiros.
                </p>
              )}
            </Card>
          </div>

          {historico.length > 1 && (
            <Card title="Histórico de planos">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="border-b border-white/5 text-xs uppercase tracking-wide text-brand-muted">
                    <tr>
                      <th className="px-4 py-3">Plano</th>
                      <th className="px-4 py-3">Ciclo</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Período</th>
                      <th className="px-4 py-3">Situação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="px-4 py-3 text-brand-text">
                          {item.plano?.nome || "—"}
                        </td>
                        <td className="px-4 py-3 capitalize text-brand-muted">
                          {item.ciclo}
                        </td>
                        <td className="px-4 py-3 text-brand-text">
                          {formatarMoeda(item.valor)}
                        </td>
                        <td className="px-4 py-3 text-brand-muted">
                          {formatarData(item.inicio)} a{" "}
                          {formatarData(item.expiraEm)}
                        </td>
                        <td className="px-4 py-3 capitalize text-brand-muted">
                          {item.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default Assinatura;
