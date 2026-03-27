import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  BarChart,
  Users,
  DollarSign,
  TrendingUp,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { GET_CLIENTES, GET_USERS, GET_CONFIGURACOES } from "../api";
import { useAuth } from "../hooks/useAuth";

import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const Relatorios = () => {
  const { userId, userLevel, masterId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [configuracao, setConfiguracao] = useState({
    pontosPorNovoUsuario: 1,
    comissaoPorVenda: 5,
  });
  const [stats, setStats] = useState({
    totalVendas: 0,
    totalClientes: 0,
    ticketMedio: 0,
    taxaConversao: 0,
    comissaoTotal: 0,
  });
  const [funnelData, setFunnelData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topBrokers, setTopBrokers] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = window.localStorage.getItem("token");

      let currentConfig = { pontosPorNovoUsuario: 1, comissaoPorVenda: 5 };
      const targetMasterId =
        userLevel === "Administrador" ||
        userLevel === "Admin" ||
        userLevel === "FullAdmin"
          ? userId
          : masterId;

      if (targetMasterId) {
        try {
          const { url, options } = GET_CONFIGURACOES(targetMasterId, token);
          const response = await fetch(url, options);
          if (response.ok) {
            const configs = await response.json();
            if (configs && configs.length > 0) {
              currentConfig = {
                pontosPorNovoUsuario: Number(
                  configs[0].pontos_por_novo_usuario ||
                    configs[0].pontosPorNovoUsuario ||
                    1,
                ),
                comissaoPorVenda: Number(
                  configs[0].comissao_por_venda ||
                    configs[0].comissaoPorVenda ||
                    5,
                ),
              };
              setConfiguracao(currentConfig);
            }
          }
        } catch (err) {
          console.error("Erro ao carregar configurações", err);
        }
      }

      // Fetch Data
      const [resClients, resUsers] = await Promise.all([
        fetch(GET_CLIENTES(token).url, GET_CLIENTES(token).options),
        fetch(GET_USERS(token).url, GET_USERS(token).options),
      ]);

      const clients = await resClients.json();
      const users = await resUsers.json();
      const parceiros = users.filter((u) => u.level === "Parceiro");

      processData(clients, parceiros, currentConfig);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  const processData = (clients, parceiros, config) => {
    // 1. KPIs Gerais
    const totalClientes = clients.length;
    const contratosFechados = clients.filter(
      (c) => c.status === "Contrato fechado",
    );
    const totalVendas = contratosFechados.reduce(
      (acc, curr) => acc + Number(curr.valor_contrato || 0),
      0,
    );
    const comissaoTotal = totalVendas * (config.comissaoPorVenda / 100);
    const ticketMedio =
      contratosFechados.length > 0 ? totalVendas / contratosFechados.length : 0;
    const taxaConversao =
      totalClientes > 0 ? (contratosFechados.length / totalClientes) * 100 : 0;

    setStats({
      totalVendas,
      totalClientes,
      ticketMedio,
      taxaConversao,
      comissaoTotal,
    });

    // 2. Funil de Vendas (Status Distribution)
    const statusCounts = clients.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});

    const funnelOrder = [
      "Novo cliente",
      "Em atendimento",
      "Contrato fechado",
      "Contrato perdido",
    ];

    const funnel = funnelOrder.map((status) => ({
      status,
      count: statusCounts[status] || 0,
      percentage:
        totalClientes > 0
          ? ((statusCounts[status] || 0) / totalClientes) * 100
          : 0,
      color:
        status === "Novo cliente"
          ? "bg-blue-500"
          : status === "Em atendimento"
            ? "bg-yellow-500"
            : status === "Contrato fechado"
              ? "bg-green-500"
              : "bg-red-500",
    }));
    setFunnelData(funnel);

    // 3. Evolução Mensal (Últimos 6 meses)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        date: d,
        label: d.toLocaleDateString("pt-BR", { month: "short" }),
        value: 0,
      });
    }

    contratosFechados.forEach((client) => {
      const date = new Date(client.updated_at || client.created_at);
      const monthIndex = months.findIndex(
        (m) =>
          m.date.getMonth() === date.getMonth() &&
          m.date.getFullYear() === date.getFullYear(),
      );
      if (monthIndex !== -1) {
        months[monthIndex].value += Number(client.valor_contrato || 0);
      }
    });

    // Calcular percentual para altura das barras
    const maxValue = Math.max(...months.map((m) => m.value), 1); // Evitar divisão por zero
    const finalMonthlyData = months.map((m) => ({
      ...m,
      height: (m.value / maxValue) * 100,
    }));
    setMonthlyData(finalMonthlyData);

    // 4. Ranking Geral Parceiros
    const brokerStats = {};
    clients.forEach((client) => {
      const parceiroId = client.corretor?.id || client.corretor_id;
      if (parceiroId) {
        if (!brokerStats[parceiroId]) {
          brokerStats[parceiroId] = {
            id: parceiroId,
            total: 0,
            count: 0,
            name: "Desconhecido",
            totalClientes: 0,
            pontos: 0,
          };
        }
        brokerStats[parceiroId].totalClientes += 1;

        if (client.status === "Contrato fechado") {
          brokerStats[parceiroId].total += Number(client.valor_contrato || 0);
          brokerStats[parceiroId].count += 1;
        }
      }
    });

    // Preencher nomes e calcular pontos
    Object.keys(brokerStats).forEach((id) => {
      const broker = parceiros.find((u) => String(u.id) === String(id));
      if (broker) {
        brokerStats[id].name = `${broker.name} ${broker.sobrenome || ""}`;
      }

      // Pontos = (clientes indicados * pontos por usuário) + (1 ponto para cada real do faturamento total)
      const pontosPorCliente =
        brokerStats[id].totalClientes *
        Number(config.pontosPorNovoUsuario || 1);
      const pontosPorFaturamento = Math.floor(brokerStats[id].total);
      brokerStats[id].pontos = pontosPorCliente + pontosPorFaturamento;
    });

    const sortedBrokers = Object.values(brokerStats)
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 10); // Top 10
    setTopBrokers(sortedBrokers);
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

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando relatórios..." />;
  }

  return (
    <div className="space-y-8 p-4 md:p-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-text mb-2">
            Relatórios Gerenciais
          </h1>
          <p className="text-brand-muted">
            Visão geral do desempenho da plataforma
          </p>
        </div>
        <div className="flex items-center gap-2 bg-brand-dark p-2 rounded-lg border border-brand-border">
          <Calendar size={18} className="text-brand-primary" />
          <span className="text-sm text-brand-muted">Dados em tempo real</span>
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
        <Card className="border-l-4 border-brand-primary bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-brand-muted text-sm font-medium uppercase tracking-wider">
                Vendas Totais
              </p>
              <h3 className="text-2xl font-bold text-brand-text mt-1">
                {loading ? "..." : formatCurrency(stats.totalVendas)}
              </h3>
            </div>
            <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="flex items-center text-xs text-green-400">
            <TrendingUp size={14} className="mr-1" />
            <span>Acumulado histórico</span>
          </div>
        </Card>

        <Card className="border-l-4 border-amber-500 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-brand-muted text-sm font-medium uppercase tracking-wider">
                Comissões
              </p>
              <h3 className="text-2xl font-bold text-brand-text mt-1">
                {loading ? "..." : formatCurrency(stats.comissaoTotal)}
              </h3>
            </div>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <DollarSign size={24} />
            </div>
          </div>
          <div className="flex items-center text-xs text-brand-muted">
            <span>Estimadas ({configuracao.comissaoPorVenda}%)</span>
          </div>
        </Card>

        <Card className="border-l-4 border-blue-500 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-brand-muted text-sm font-medium uppercase tracking-wider">
                Total Clientes
              </p>
              <h3 className="text-2xl font-bold text-brand-text mt-1">
                {loading ? "..." : stats.totalClientes}
              </h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Users size={24} />
            </div>
          </div>
          <div className="flex items-center text-xs text-brand-muted">
            <span>Base ativa de leads</span>
          </div>
        </Card>

        <Card className="border-l-4 border-purple-500 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-brand-muted text-sm font-medium uppercase tracking-wider">
                Ticket Médio
              </p>
              <h3 className="text-2xl font-bold text-brand-text mt-1">
                {loading ? "..." : formatCurrency(stats.ticketMedio)}
              </h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <BarChart size={24} />
            </div>
          </div>
          <div className="flex items-center text-xs text-brand-muted">
            <span>Por contrato fechado</span>
          </div>
        </Card>

        <Card className="border-l-4 border-green-500 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-brand-muted text-sm font-medium uppercase tracking-wider">
                Conversão Global
              </p>
              <h3 className="text-2xl font-bold text-brand-text mt-1">
                {loading ? "..." : `${stats.taxaConversao.toFixed(1)}%`}
              </h3>
            </div>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <Target size={24} />
            </div>
          </div>
          <div className="flex items-center text-xs text-brand-muted">
            <span>Leads vs. Fechamentos</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico de Barras CSS - Evolução Mensal */}
        <div className="lg:col-span-2">
          <Card title="Evolução de Vendas (Últimos 6 Meses)" className="h-full">
            <div className="mt-8 h-64 flex items-end justify-between gap-4 px-4">
              {monthlyData.length === 0 ||
              monthlyData.every((m) => m.value === 0) ? (
                <div className="w-full h-full flex items-center justify-center text-brand-muted">
                  Sem dados suficientes para o período.
                </div>
              ) : (
                monthlyData.map((data, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 group relative"
                  >
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-surface text-brand-text text-xs py-1 px-2 rounded border border-brand-border pointer-events-none whitespace-nowrap z-10">
                      {formatCurrency(data.value)}
                    </div>

                    {/* Barra */}
                    <div
                      className="w-full max-w-[60px] bg-brand-primary/20 hover:bg-brand-primary/40 rounded-t-sm transition-all duration-500 relative overflow-hidden"
                      style={{ height: `${data.height}%` }}
                    >
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-primary"></div>
                    </div>

                    {/* Label */}
                    <div className="mt-3 text-xs text-brand-muted font-medium">
                      {data.label}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Funil de Vendas */}
        <div className="lg:col-span-1">
          <Card title="Funil de Vendas" className="h-full">
            <div className="space-y-6 mt-4">
              {loading ? (
                <LoadingSpinner size={48} message="Carregando funil..." />
              ) : (
                funnelData.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-brand-muted">
                        {item.status}
                      </span>
                      <span className="text-xs font-bold text-brand-text bg-brand-border px-2 py-1 rounded-full">
                        {item.count}
                      </span>
                    </div>
                    <div className="w-full bg-brand-dark rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${item.color} transition-all duration-1000`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-right mt-1">
                      <span className="text-[10px] text-brand-muted">
                        {item.percentage.toFixed(1)}% do total
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Ranking Geral */}
      <Card title="Ranking Geral de Parceiros" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted text-sm uppercase">
                <th className="py-4 px-4 font-semibold">Posição</th>
                <th className="py-4 px-4 font-semibold">Parceiro</th>
                <th className="py-4 px-4 font-semibold text-center">
                  Pontuação
                </th>
                <th className="py-4 px-4 font-semibold text-center">Vendas</th>
                <th className="py-4 px-4 font-semibold text-right">
                  Total Vendido
                </th>
                <th className="py-4 px-4 font-semibold text-right text-amber-500">
                  Comissão
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-brand-muted">
                    <LoadingSpinner size={48} message="Carregando ranking..." />
                  </td>
                </tr>
              ) : topBrokers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-brand-muted">
                    Nenhuma venda registrada na plataforma.
                  </td>
                </tr>
              ) : (
                topBrokers.map((broker, index) => (
                  <tr
                    key={broker.id}
                    className="hover:bg-brand-dark/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div
                        className={`
                        w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                        ${
                          index === 0
                            ? "bg-brand-primary text-brand-dark shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                            : index === 1
                              ? "bg-gray-300 text-gray-800"
                              : index === 2
                                ? "bg-amber-700 text-brand-text"
                                : "bg-brand-dark text-brand-muted border border-brand-border"
                        }
                      `}
                      >
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-brand-text">
                        {broker.name}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2 py-1 bg-brand-primary/10 text-brand-primary font-bold rounded text-xs border border-brand-primary/20">
                        {broker.pontos} pts
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-block px-2 py-1 bg-brand-dark rounded text-xs text-brand-muted border border-brand-border">
                        {broker.count}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-brand-primary">
                      {formatCurrency(broker.total)}
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-amber-500">
                      {formatCurrency(
                        broker.total * (configuracao.comissaoPorVenda / 100),
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Relatorios;
