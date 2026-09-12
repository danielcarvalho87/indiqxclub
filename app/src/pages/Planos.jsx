import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  CreditCard,
  Pencil,
  Plus,
  Star,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { LoadingSpinner } from "../components/ui/LoadingSpinner";
import PlanoModal from "../components/Modals/PlanoModal";
import AssinaturaModal from "../components/Modals/AssinaturaModal";
import ConfirmModal from "../components/Modals/ConfirmModal";
import {
  DELETE_ASSINATURA,
  DELETE_PLANO,
  GET_ASSINATURAS,
  GET_PLANOS,
  POST_ASSINATURA,
  POST_PLANO,
  PUT_PLANO,
} from "../api";
import { apiFetch, mensagemDeErro } from "../lib/http";
import { formatarMoeda } from "../utils/pontos";

/**
 * Planos de assinatura — exclusivo do FullAdmin.
 *
 * Duas partes: o catálogo de planos e o vínculo de cada administrador. A
 * lista de administradores vem completa, inclusive quem ainda não tem
 * plano, para que ninguém fique esquecido sem assinatura.
 */

function formatarData(valor) {
  if (!valor) return "—";
  const data = new Date(`${String(valor).slice(0, 10)}T00:00:00`);
  return Number.isNaN(data.getTime())
    ? "—"
    : data.toLocaleDateString("pt-BR");
}

function textoLimite(limite) {
  return limite === null || limite === undefined
    ? "ilimitado"
    : `até ${limite}`;
}

const Planos = () => {
  const [loading, setLoading] = useState(true);
  const [planos, setPlanos] = useState([]);
  const [assinaturas, setAssinaturas] = useState([]);

  const [planoEmEdicao, setPlanoEmEdicao] = useState(null);
  const [planoModalAberto, setPlanoModalAberto] = useState(false);
  const [linhaSelecionada, setLinhaSelecionada] = useState(null);
  const [planoParaDesativar, setPlanoParaDesativar] = useState(null);
  const [assinaturaParaCancelar, setAssinaturaParaCancelar] = useState(null);

  const carregar = useCallback(async () => {
    const token = window.localStorage.getItem("token");
    setLoading(true);

    try {
      const { url: urlPlanos, options: optPlanos } = GET_PLANOS(token, true);
      const { url: urlAss, options: optAss } = GET_ASSINATURAS(token);

      const [resPlanos, resAss] = await Promise.all([
        apiFetch(urlPlanos, optPlanos),
        apiFetch(urlAss, optAss),
      ]);

      if (!resPlanos.ok || !resAss.ok) {
        toast.error(
          await mensagemDeErro(
            resPlanos.ok ? resAss : resPlanos,
            "Erro ao carregar planos.",
          ),
        );
        return;
      }

      setPlanos(await resPlanos.json());
      setAssinaturas(await resAss.json());
    } catch (error) {
      console.error("Erro ao carregar planos:", error);
      toast.error("Erro ao carregar planos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const salvarPlano = async (dados) => {
    const token = window.localStorage.getItem("token");
    const { url, options } = planoEmEdicao
      ? PUT_PLANO(planoEmEdicao.id, dados, token)
      : POST_PLANO(dados, token);

    const response = await apiFetch(url, options);

    if (!response.ok) {
      toast.error(await mensagemDeErro(response, "Erro ao salvar o plano."));
      return;
    }

    toast.success(planoEmEdicao ? "Plano atualizado." : "Plano criado.");
    setPlanoModalAberto(false);
    setPlanoEmEdicao(null);
    carregar();
  };

  const desativarPlano = async () => {
    const token = window.localStorage.getItem("token");
    const { url, options } = DELETE_PLANO(planoParaDesativar.id, token);
    const response = await apiFetch(url, options);

    if (!response.ok) {
      toast.error(await mensagemDeErro(response, "Erro ao desativar o plano."));
      return;
    }

    toast.success("Plano desativado.");
    setPlanoParaDesativar(null);
    carregar();
  };

  const vincularPlano = async (dados) => {
    const token = window.localStorage.getItem("token");
    const { url, options } = POST_ASSINATURA(dados, token);
    const response = await apiFetch(url, options);

    if (!response.ok) {
      toast.error(await mensagemDeErro(response, "Erro ao vincular o plano."));
      return;
    }

    toast.success("Plano vinculado.");
    setLinhaSelecionada(null);
    carregar();
  };

  const cancelarAssinatura = async () => {
    const token = window.localStorage.getItem("token");
    const { url, options } = DELETE_ASSINATURA(
      assinaturaParaCancelar.assinatura.id,
      token,
    );
    const response = await apiFetch(url, options);

    if (!response.ok) {
      toast.error(
        await mensagemDeErro(response, "Erro ao cancelar a assinatura."),
      );
      return;
    }

    toast.success("Assinatura cancelada.");
    setAssinaturaParaCancelar(null);
    carregar();
  };

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando planos..." />;
  }

  const planosAtivos = planos.filter((plano) => plano.ativo);

  return (
    <div className="space-y-6 p-3 md:p-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold text-brand-text">
            <CreditCard className="text-brand-primary" /> Planos de assinatura
          </h1>
          <p className="mt-1 text-brand-muted">
            Catálogo de planos e vínculo de cada administrador.
          </p>
        </div>
        <Button
          onClick={() => {
            setPlanoEmEdicao(null);
            setPlanoModalAberto(true);
          }}
        >
          <Plus size={16} />
          Novo plano
        </Button>
      </div>

      <Card title="Catálogo">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/5 text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Parceiros</th>
                <th className="px-4 py-3">Mensal</th>
                <th className="px-4 py-3">Anual</th>
                <th className="px-4 py-3">Parceiro extra</th>
                <th className="px-4 py-3">Situação</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {planos.map((plano) => (
                <tr
                  key={plano.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-2 font-semibold text-brand-text">
                      {plano.nome}
                      {plano.destaque && (
                        <Star size={14} className="text-amber-400" />
                      )}
                    </span>
                    {plano.descricao && (
                      <span className="mt-0.5 block text-xs text-brand-muted">
                        {plano.descricao}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-brand-muted">
                    {textoLimite(plano.limiteParceiros)}
                  </td>
                  <td className="px-4 py-4 text-brand-text">
                    {formatarMoeda(plano.precoMensal)}
                  </td>
                  <td className="px-4 py-4 text-brand-text">
                    {plano.precoAnual
                      ? formatarMoeda(plano.precoAnual)
                      : "negociado"}
                  </td>
                  <td className="px-4 py-4 text-brand-muted">
                    {plano.precoParceiroExtra
                      ? formatarMoeda(plano.precoParceiroExtra)
                      : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        plano.ativo
                          ? "bg-emerald-900/30 text-emerald-400"
                          : "bg-brand-border text-brand-muted"
                      }`}
                    >
                      {plano.ativo ? "Ativo" : "Desativado"}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setPlanoEmEdicao(plano);
                          setPlanoModalAberto(true);
                        }}
                        className="rounded-full p-2 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text"
                        title="Editar plano"
                      >
                        <Pencil size={16} />
                      </button>
                      {plano.ativo && (
                        <button
                          onClick={() => setPlanoParaDesativar(plano)}
                          className="rounded-full p-2 text-red-400 transition-colors hover:bg-red-500/10"
                          title="Desativar plano"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Assinaturas por administrador">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="border-b border-white/5 text-xs uppercase tracking-wide text-brand-muted">
              <tr>
                <th className="px-4 py-3">Administrador</th>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Ciclo</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Vencimento</th>
                <th className="px-4 py-3">Uso</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {assinaturas.map((linha) => (
                <tr
                  key={linha.usuario.id}
                  className="border-b border-white/5 last:border-0"
                >
                  <td className="px-4 py-4">
                    <span className="block font-semibold text-brand-text">
                      {[linha.usuario.name, linha.usuario.sobrenome]
                        .filter(Boolean)
                        .join(" ")}
                    </span>
                    <span className="text-xs text-brand-muted">
                      {linha.usuario.email}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {linha.plano ? (
                      <span className="font-medium text-brand-text">
                        {linha.plano.nome}
                      </span>
                    ) : (
                      <span className="rounded bg-amber-900/30 px-2 py-1 text-xs font-semibold text-amber-400">
                        Sem plano
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 capitalize text-brand-muted">
                    {linha.assinatura?.ciclo || "—"}
                  </td>
                  <td className="px-4 py-4 text-brand-text">
                    {linha.assinatura
                      ? formatarMoeda(linha.assinatura.valor)
                      : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={
                        linha.vencida ? "text-red-400" : "text-brand-muted"
                      }
                    >
                      {formatarData(linha.assinatura?.expiraEm)}
                    </span>
                    {linha.vencida && (
                      <span className="mt-0.5 block text-xs text-red-400">
                        vencida
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-brand-muted">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} />
                      {linha.uso.parceirosAtivos} / {textoLimite(linha.uso.limite)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setLinhaSelecionada(linha)}
                      >
                        {linha.assinatura ? "Alterar" : "Vincular"}
                      </Button>
                      {linha.assinatura && (
                        <button
                          onClick={() => setAssinaturaParaCancelar(linha)}
                          className="rounded-full p-2 text-red-400 transition-colors hover:bg-red-500/10"
                          title="Cancelar assinatura"
                        >
                          <XCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {assinaturas.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-brand-muted"
                  >
                    Nenhum administrador cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <PlanoModal
        isOpen={planoModalAberto}
        onClose={() => {
          setPlanoModalAberto(false);
          setPlanoEmEdicao(null);
        }}
        onSubmit={salvarPlano}
        initialData={planoEmEdicao}
      />

      <AssinaturaModal
        isOpen={Boolean(linhaSelecionada)}
        onClose={() => setLinhaSelecionada(null)}
        onSubmit={vincularPlano}
        planos={planosAtivos}
        administrador={linhaSelecionada?.usuario}
        assinaturaAtual={linhaSelecionada?.assinatura}
      />

      <ConfirmModal
        isOpen={Boolean(planoParaDesativar)}
        onClose={() => setPlanoParaDesativar(null)}
        onConfirm={desativarPlano}
        title="Desativar plano"
        message={`O plano ${planoParaDesativar?.nome || ""} sai do catálogo e deixa de aparecer para novas contratações.`}
        warning="Quem já assinou continua com o plano ativo."
        confirmLabel="Desativar"
      />

      <ConfirmModal
        isOpen={Boolean(assinaturaParaCancelar)}
        onClose={() => setAssinaturaParaCancelar(null)}
        onConfirm={cancelarAssinatura}
        title="Cancelar assinatura"
        message={`A assinatura de ${assinaturaParaCancelar?.usuario?.name || ""} será encerrada.`}
        warning="A empresa fica sem plano e sem limite de parceiros até uma nova contratação."
        confirmLabel="Cancelar assinatura"
      />
    </div>
  );
};

export default Planos;
