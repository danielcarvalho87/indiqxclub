import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  TrendingUp,
  Users,
  Award,
  DollarSign,
  CheckCircle,
  Lock,
  Trophy,
  Target,
  Star,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { GET_CLIENTES, GET_BONIFICACOES, GET_CONFIGURACOES } from "../api";
import { useAuth } from "../hooks/useAuth";

import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const MeusGanhos = () => {
  const { userId, userLevel, masterId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [configuracao, setConfiguracao] = useState({
    pontosPorNovoUsuario: 1, // default
    comissaoPorVenda: 5, // default 5%
  });
  const [stats, setStats] = useState({
    clientesIndicados: 0,
    faturamentoTotal: 0,
    pontosAcumulados: 0,
    comissaoEstimada: 0,
  });
  const [bonificacoes, setBonificacoes] = useState([]);
  const [nextGoal, setNextGoal] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = window.localStorage.getItem("token");

      // Descobrir qual é o masterId para buscar configurações
      const targetMasterId =
        userLevel === "Administrador" ||
        userLevel === "Admin" ||
        userLevel === "FullAdmin"
          ? userId
          : masterId;

      let configData = { pontosPorNovoUsuario: 1, comissaoPorVenda: 5 }; // default fallback

      if (targetMasterId) {
        try {
          const { url: urlConfig, options: optionsConfig } = GET_CONFIGURACOES(
            targetMasterId,
            token,
          );
          const resConfig = await fetch(urlConfig, optionsConfig);
          if (resConfig.ok) {
            const configs = await resConfig.json();
            if (configs && configs.length > 0) {
              // Pega a primeira configuração encontrada
              configData = {
                pontosPorNovoUsuario:
                  configs[0].pontos_por_novo_usuario ||
                  configs[0].pontosPorNovoUsuario ||
                  1,
                comissaoPorVenda:
                  configs[0].comissao_por_venda ||
                  configs[0].comissaoPorVenda ||
                  5,
              };
            }
          }
        } catch (error) {
          console.error("Erro ao buscar configurações:", error);
        }
      }
      setConfiguracao(configData);

      // Fetch Clientes
      const { url: urlClientes, options: optionsClientes } =
        GET_CLIENTES(token);
      const resClientes = await fetch(urlClientes, optionsClientes);
      const clientes = await resClientes.json();

      // Fetch Bonificacoes
      const { url: urlBonificacoes, options: optionsBonificacoes } =
        GET_BONIFICACOES(token);
      const resBonificacoes = await fetch(urlBonificacoes, optionsBonificacoes);
      const bonificacoesData = await resBonificacoes.json();

      // Filtrar e Calcular
      processData(clientes, bonificacoesData, configData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar seus ganhos.");
    } finally {
      setLoading(false);
    }
  };

  const processData = (clientes, bonificacoesData, configData) => {
    // Filtrar clientes do usuário logado
    const meusClientes = clientes.filter((c) => {
      const parceiroId = c.corretor?.id || c.corretor_id;
      return parceiroId && String(parceiroId) === String(userId);
    });

    const clientesIndicados = meusClientes.length;

    // Filtrar contratos fechados
    const contratosFechados = meusClientes.filter(
      (c) => c.status === "Contrato fechado",
    );

    // Calcular Faturamento e Pontos
    const faturamentoTotal = contratosFechados.reduce((acc, curr) => {
      return acc + Number(curr.valor_contrato || 0);
    }, 0);

    // Pontos = (clientes indicados * pontos por usuário) + (1 ponto para cada real do faturamento total)
    const pontosAcumulados =
      clientesIndicados * Number(configData.pontosPorNovoUsuario) +
      Math.floor(faturamentoTotal);

    // Comissão é baseada na porcentagem configurada sobre o faturamento total
    const comissaoEstimada =
      faturamentoTotal * (Number(configData.comissaoPorVenda) / 100);

    setStats({
      clientesIndicados,
      faturamentoTotal,
      pontosAcumulados,
      comissaoEstimada,
    });

    // Ordenar bonificações por pontuação
    const bonificacoesOrdenadas = bonificacoesData.sort(
      (a, b) => a.pontuacao - b.pontuacao,
    );
    setBonificacoes(bonificacoesOrdenadas);

    // Encontrar o próximo objetivo
    const proximo = bonificacoesOrdenadas.find(
      (b) => b.pontuacao > pontosAcumulados,
    );
    setNextGoal(proximo || null);
  };

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPoints = (value) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  // Calcular progresso total para a barra global
  const maxPoints =
    bonificacoes.length > 0
      ? bonificacoes[bonificacoes.length - 1].pontuacao
      : 100;
  const globalProgress = Math.min(
    100,
    (stats.pontosAcumulados / maxPoints) * 100,
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando ganhos..." />;
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text flex items-center gap-2">
            <TrendingUp className="text-brand-primary" /> Meus Ganhos
          </h1>
          <p className="text-brand-muted mt-1">
            Acompanhe seu desempenho e conquiste prêmios
          </p>
        </div>

        {nextGoal && (
          <div className="bg-brand-surface/80 border border-brand-primary/30 rounded-lg p-3 flex items-center gap-3 backdrop-blur-sm">
            <div className="bg-brand-primary/20 p-2 rounded-full">
              <Target className="text-brand-primary w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-brand-muted uppercase font-bold">
                Próxima Meta
              </p>
              <p className="text-sm text-brand-text font-medium">
                Faltam{" "}
                <span className="text-brand-primary font-bold">
                  {formatPoints(nextGoal.pontuacao - stats.pontosAcumulados)}
                </span>{" "}
                pontos
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards - Modern Glassmorphism Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="!p-0 relative overflow-hidden group bg-gradient-to-br from-gray-900 to-gray-800 border-brand-border/50 hover:border-blue-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users size={80} />
          </div>
          <div className="p-5 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <Users size={20} />
              </div>
              <p className="text-brand-muted text-xs font-bold uppercase tracking-wider">
                Indicações
              </p>
            </div>
            <h3 className="text-2xl font-bold text-brand-text mt-2 tracking-tight">
              {stats.clientesIndicados}
            </h3>
            <p className="text-xs text-brand-muted mt-1">
              Clientes cadastrados
            </p>
          </div>
          <div className="h-1 w-full bg-brand-dark mt-4">
            <div className="h-full bg-blue-500 w-full opacity-50"></div>
          </div>
        </Card>

        <Card className="!p-0 relative overflow-hidden group bg-gradient-to-br from-gray-900 to-gray-800 border-brand-border/50 hover:border-green-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <DollarSign size={80} />
          </div>
          <div className="p-5 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                <DollarSign size={20} />
              </div>
              <p className="text-brand-muted text-xs font-bold uppercase tracking-wider">
                Faturamento
              </p>
            </div>
            <h3 className="text-2xl font-bold text-brand-text mt-2 tracking-tight">
              {formatCurrency(stats.faturamentoTotal)}
            </h3>
            <p className="text-xs text-brand-muted mt-1">Contratos fechados</p>
          </div>
          <div className="h-1 w-full bg-brand-dark mt-4">
            <div className="h-full bg-green-500 w-full opacity-50"></div>
          </div>
        </Card>

        <Card className="!p-0 relative overflow-hidden group bg-gradient-to-br from-gray-900 to-gray-800 border-brand-border/50 hover:border-brand-primary/50 transition-all duration-300 shadow-[0_0_15px_rgba(234,179,8,0.05)] hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Trophy size={80} className="text-brand-primary" />
          </div>
          <div className="p-5 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-brand-primary/20 text-brand-primary">
                <Award size={20} />
              </div>
              <p className="text-brand-muted text-xs font-bold uppercase tracking-wider">
                Meus Pontos
              </p>
            </div>
            <h3 className="text-2xl font-bold text-brand-text mt-2 text-brand-primary tracking-tight">
              {formatPoints(stats.pontosAcumulados)}
            </h3>
            <p className="text-xs text-brand-muted mt-1">
              {configuracao.pontosPorNovoUsuario} Pontos por Cliente
            </p>
          </div>
          <div className="h-1 w-full bg-brand-dark mt-4">
            <div className="h-full bg-brand-primary w-full opacity-70"></div>
          </div>
        </Card>

        <Card className="!p-0 relative overflow-hidden group bg-gradient-to-br from-gray-900 to-gray-800 border-brand-border/50 hover:border-purple-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp size={80} />
          </div>
          <div className="p-5 relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                <Star size={20} />
              </div>
              <p className="text-brand-muted text-xs font-bold uppercase tracking-wider">
                Comissão ({configuracao.comissaoPorVenda}%)
              </p>
            </div>
            <h3 className="text-2xl font-bold text-brand-text mt-2 tracking-tight">
              {formatCurrency(stats.comissaoEstimada)}
            </h3>
            <p className="text-xs text-brand-muted mt-1">
              Estimativa de ganhos
            </p>
          </div>
          <div className="h-1 w-full bg-brand-dark mt-4">
            <div className="h-full bg-purple-500 w-full opacity-50"></div>
          </div>
        </Card>
      </div>

      {/* Timeline Section */}
      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-brand-text flex items-center">
            <Trophy className="mr-3 text-brand-primary" />
            Trilha de Conquistas
          </h2>

          {/* Global Progress Bar */}
          <div className="hidden md:flex items-center gap-3 w-1/3">
            <span className="text-xs font-bold text-brand-muted uppercase">
              Progresso Total
            </span>
            <div className="flex-1 h-3 bg-brand-dark rounded-full overflow-hidden border border-brand-border">
              <div
                className="h-full bg-gradient-to-r from-brand-primary to-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                style={{ width: `${globalProgress}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold text-brand-primary">
              {Math.floor(globalProgress)}%
            </span>
          </div>
        </div>

        <div className="relative pb-20">
          {/* Central Line Background */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-brand-dark rounded-full transform md:-translate-x-1/2"></div>

          {/* Active Progress Line (Dynamic Height) */}
          <div
            className="absolute left-8 md:left-1/2 top-0 w-1 bg-gradient-to-b from-brand-primary via-yellow-500 to-gray-800 rounded-full transform md:-translate-x-1/2 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(234,179,8,0.4)]"
            style={{
              height: `${Math.min(100, bonificacoes.findIndex((b) => b.id === nextGoal?.id) !== -1 ? (bonificacoes.findIndex((b) => b.id === nextGoal?.id) / bonificacoes.length) * 100 : 100)}%`,
            }}
          ></div>

          <div className="space-y-16">
            {bonificacoes.map((bonificacao, index) => {
              const atingido = stats.pontosAcumulados >= bonificacao.pontuacao;
              const isNext = nextGoal?.id === bonificacao.id;
              const isLeft = index % 2 === 0;
              const progresso = Math.min(
                100,
                (stats.pontosAcumulados / bonificacao.pontuacao) * 100,
              );

              return (
                <div
                  key={bonificacao.id}
                  className={`relative flex items-center md:justify-between ${isLeft ? "flex-row" : "flex-row-reverse md:flex-row"}`}
                >
                  {/* Card Content */}
                  <div
                    className={`flex w-full md:w-[45%] ${isLeft ? "md:justify-end" : "md:justify-start pl-20 md:pl-0"}`}
                  >
                    <div
                      className={`
                      relative w-full p-6 rounded-xl border backdrop-blur-md transition-all duration-500 group
                      ${
                        atingido
                          ? "bg-gradient-to-br from-gray-900/90 to-black/90 border-brand-primary/50 shadow-[0_0_30px_rgba(234,179,8,0.15)]"
                          : isNext
                            ? "bg-brand-surface/80 border-brand-border shadow-[0_0_20px_rgba(255,255,255,0.05)] scale-105 z-10"
                            : "bg-brand-surface/40 border-brand-border grayscale opacity-70 hover:opacity-100 hover:grayscale-0"
                      }
                    `}
                    >
                      {/* Badge de Status */}
                      <div className="absolute -top-3 right-4">
                        {atingido ? (
                          <span className="bg-brand-primary text-brand-dark text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                            <CheckCircle size={12} /> CONQUISTADO
                          </span>
                        ) : isNext ? (
                          <span className="bg-blue-600 text-brand-text text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                            <Target size={12} /> PRÓXIMO ALVO
                          </span>
                        ) : (
                          <span className="bg-brand-border text-brand-muted text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                            <Lock size={12} /> BLOQUEADO
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-center mb-4 mt-2">
                        <h3
                          className={`text-xl font-bold ${atingido ? "text-brand-primary" : "text-brand-text"}`}
                        >
                          {bonificacao.titulo}
                        </h3>
                        <span className="text-sm font-mono text-brand-muted">
                          {formatPoints(bonificacao.pontuacao)} pts
                        </span>
                      </div>

                      <p className="text-brand-muted text-sm mb-6 leading-relaxed border-l-2 border-brand-border pl-3">
                        {bonificacao.descricao}
                      </p>

                      {/* Barra de Progresso Individual */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                          <span
                            className={
                              atingido
                                ? "text-brand-primary"
                                : "text-brand-muted"
                            }
                          >
                            Progresso
                          </span>
                          <span className="text-brand-text">
                            {Math.floor(progresso)}%
                          </span>
                        </div>
                        <div className="w-full bg-brand-dark rounded-full h-2 overflow-hidden border border-brand-border">
                          <div
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              atingido
                                ? "bg-gradient-to-r from-brand-primary to-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                : "bg-blue-600"
                            }`}
                            style={{ width: `${progresso}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ícone Central Conector */}
                  <div
                    className={`
                    absolute left-8 md:left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-1/2
                    flex items-center justify-center w-14 h-14 rounded-full border-4 z-20 transition-all duration-500
                    ${
                      atingido
                        ? "bg-brand-primary border-brand-dark shadow-[0_0_20px_rgba(234,179,8,0.6)] scale-110"
                        : isNext
                          ? "bg-brand-surface border-brand-primary shadow-[0_0_15px_rgba(234,179,8,0.3)] animate-bounce-slow"
                          : "bg-brand-surface border-brand-border"
                    }
                  `}
                  >
                    {atingido ? (
                      <Trophy
                        className="text-brand-dark w-7 h-7"
                        fill="currentColor"
                      />
                    ) : isNext ? (
                      <Target className="text-brand-primary w-7 h-7" />
                    ) : (
                      <Lock className="text-brand-muted w-6 h-6" />
                    )}
                  </div>

                  {/* Espaço Vazio para Alinhamento (Desktop) */}
                  <div className="hidden md:block md:w-[45%]"></div>
                </div>
              );
            })}
          </div>
        </div>

        {bonificacoes.length === 0 && !loading && (
          <div className="text-center py-16 text-brand-muted bg-brand-surface/30 rounded-2xl border border-brand-border border-dashed">
            <Trophy size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">
              Nenhuma bonificação cadastrada.
            </p>
            <p className="text-sm">
              Cadastre novas metas para visualizar sua trilha de conquistas.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeusGanhos;
