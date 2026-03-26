import React, { useState, useEffect } from "react";
import { Card } from "../components/ui/Card";
import {
  User,
  DollarSign,
  Activity,
  TrendingUp,
  Users,
  Pencil,
  Eye,
} from "lucide-react";
import {
  GET_CLIENTES,
  GET_USERS,
  PUT_CLIENTE,
  GET_CONFIGURACOES,
} from "../api";
import { toast } from "react-toastify";
import ClientRegistrationModal from "../components/Modals/ClientRegistrationModal";
import ClientViewModal from "../components/Modals/ClientViewModal";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { userId, userLevel, masterId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [configuracao, setConfiguracao] = useState({
    pontosPorNovoUsuario: 1,
    comissaoPorVenda: 5,
  });
  const [stats, setStats] = useState({
    totalClientes: 0,
    vendasMes: 0,
    taxaConversao: 0,
    totalFechados: 0,
    totalPerdidos: 0,
    leadsConvertidos: 0,
    comissoesMes: 0,
  });
  const [topBrokers, setTopBrokers] = useState([]);
  const [recentClients, setRecentClients] = useState([]);
  const [parceiros, setParceiros] = useState([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

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

      // Fetch Clients
      const { url: urlClients, options: optionsClients } = GET_CLIENTES(token);
      const resClients = await fetch(urlClients, optionsClients);
      const clientsData = await resClients.json();

      // Fetch Users (Parceiros)
      const { url: urlUsers, options: optionsUsers } = GET_USERS(token);
      const resUsers = await fetch(urlUsers, optionsUsers);
      const usersData = await resUsers.json();

      const parceirosList = usersData.filter((u) => u.level === "Parceiro");
      setParceiros(parceirosList);

      processStats(clientsData, parceirosList, currentConfig);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      toast.error("Erro ao carregar dados do dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const processStats = (clients, parceirosList, config) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // 1. Total Clientes
    const totalClientes = clients.length;

    // 2. Vendas Mês (Contrato fechado + Current Month)
    // Assuming updated_at is the closing date for 'Contrato fechado'
    const vendasMes = clients.reduce((acc, client) => {
      if (client.status === "Contrato fechado") {
        const date = new Date(client.updated_at || client.created_at);
        if (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear
        ) {
          return acc + Number(client.valor_contrato || 0);
        }
      }
      return acc;
    }, 0);

    // 3. Taxa de Conversão (Fechados / Total)
    const totalFechados = clients.filter(
      (c) => c.status === "Contrato fechado",
    ).length;
    const totalPerdidos = clients.filter(
      (c) => c.status === "Contrato perdido",
    ).length;
    const taxaConversao =
      totalClientes > 0 ? (totalFechados / totalClientes) * 100 : 0;

    // 4. Leads Convertidos
    const leadsConvertidos = totalFechados;

    // 4.5 Comissões Mês
    const comissoesMes = vendasMes * (config.comissaoPorVenda / 100);

    setStats({
      totalClientes,
      vendasMes,
      taxaConversao,
      totalFechados,
      totalPerdidos,
      leadsConvertidos,
      comissoesMes,
    });

    // 5. Ranking Parceiros (Top 5 Sales in Current Month)
    const brokerSales = {};

    clients.forEach((client) => {
      // Calculate points for all clients of the broker
      const parceiroId = client.corretor?.id || client.corretor_id;
      if (parceiroId) {
        if (!brokerSales[parceiroId]) {
          brokerSales[parceiroId] = {
            id: parceiroId,
            name: client.corretor?.name || "Desconhecido",
            sobrenome: client.corretor?.sobrenome || "",
            total: 0,
            count: 0,
            totalClientes: 0,
            pontos: 0,
          };
        }
        brokerSales[parceiroId].totalClientes += 1;

        if (client.status === "Contrato fechado") {
          // All time total for points calculation
          brokerSales[parceiroId].total += Number(client.valor_contrato || 0);

          const date = new Date(client.updated_at || client.created_at);
          if (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          ) {
            brokerSales[parceiroId].count += 1;
          }
        }
      }
    });

    // Map IDs to names if missing from client object (using users list)
    Object.keys(brokerSales).forEach((id) => {
      if (brokerSales[id].name === "Desconhecido") {
        const broker = parceirosList.find((u) => String(u.id) === String(id));
        if (broker) {
          brokerSales[id].name = broker.name;
          brokerSales[id].sobrenome = broker.sobrenome;
        }
      }

      // Pontos = (clientes indicados * pontos por usuário) + (1 ponto para cada real do faturamento total)
      const pontosPorCliente =
        brokerSales[id].totalClientes *
        Number(config.pontosPorNovoUsuario || 1);
      const pontosPorFaturamento = Math.floor(brokerSales[id].total);
      brokerSales[id].pontos = pontosPorCliente + pontosPorFaturamento;
    });

    const sortedBrokers = Object.values(brokerSales)
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 5);

    setTopBrokers(sortedBrokers);

    // 6. Novos Clientes (Top 5 Recent)
    const sortedClients = [...clients]
      .sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      })
      .slice(0, 5);

    setRecentClients(sortedClients);
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

  const handleEditClient = (client) => {
    setSelectedCliente(client);
    setIsModalOpen(true);
  };

  const handleViewClient = (client) => {
    setSelectedCliente(client);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCliente(null);
    setIsModalOpen(false);
    setIsViewModalOpen(false);
  };

  const handleSaveClient = async (data) => {
    try {
      const token = window.localStorage.getItem("token");
      if (selectedCliente) {
        const { url, options } = PUT_CLIENTE(selectedCliente.id, data, token);
        const response = await fetch(url, options);
        if (response.ok) {
          toast.success("Cliente atualizado com sucesso!");
          fetchData(); // Refresh data
          handleCloseModal();
        } else {
          toast.error("Erro ao atualizar cliente.");
        }
      }
    } catch (error) {
      console.error("Erro ao salvar cliente:", error);
      toast.error("Erro de conexão.");
    }
  };

  const statsCards = [
    {
      title: "Total de leads",
      value: loading ? "..." : stats.totalClientes,
      description: "Base ativa de cadastros",
      icon: Users,
      borderColor: "border-blue-500",
      iconClass: "bg-blue-500/10 text-blue-500",
    },
    {
      title: "Leads convertidos",
      value: loading ? "..." : stats.leadsConvertidos,
      description: "Contratos fechados",
      icon: Activity,
      borderColor: "border-purple-500",
      iconClass: "bg-purple-500/10 text-purple-500",
    },
    {
      title: "Vendas no mês",
      value: loading ? "..." : formatCurrency(stats.vendasMes),
      description: "Volume fechado no período",
      icon: DollarSign,
      borderColor: "border-emerald-500",
      iconClass: "bg-emerald-500/10 text-emerald-500",
    },
    {
      title: "Comissões",
      value: loading ? "..." : formatCurrency(stats.comissoesMes),
      description: `Estimadas com base em ${configuracao.comissaoPorVenda}%`,
      icon: DollarSign,
      borderColor: "border-amber-500",
      iconClass: "bg-amber-500/10 text-amber-500",
    },
  ];

  const statusClassMap = {
    "Novo cliente": "bg-blue-500/10 text-blue-300",
    "Em atendimento": "bg-amber-500/10 text-amber-300",
    "Contrato fechado": "bg-emerald-500/10 text-emerald-300",
    "Contrato perdido": "bg-rose-500/10 text-rose-300",
  };

  return (
    <div className="space-y-6 p-3 md:p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {statsCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className={`border-l-4 ${card.borderColor} bg-gradient-to-br from-gray-800 to-gray-900 p-5`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-brand-muted text-sm font-medium uppercase tracking-wider">
                    {card.title}
                  </p>
                  <h3 className="text-2xl font-bold text-brand-text mt-1">
                    {card.value}
                  </h3>
                </div>
                <div className={`p-2 rounded-lg ${card.iconClass}`}>
                  <Icon size={24} />
                </div>
              </div>
              <div className="flex items-center text-xs text-brand-muted">
                <span>{card.description}</span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card title="Novos clientes" className="min-h-[380px]">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-brand-muted">
              Últimos cadastros realizados
            </p>
            <div className="rounded-2xl bg-brand-surfaceAlt px-4 py-2 text-sm font-medium text-brand-muted">
              {loading ? "..." : `${recentClients.length} registros`}
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center text-brand-muted">
              Carregando clientes...
            </div>
          ) : recentClients.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center rounded-[28px] border border-dashed border-white/10 bg-brand-surfaceAlt text-brand-muted">
              <User size={42} className="mb-4 opacity-40" />
              <p>Nenhum cliente cadastrado.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentClients.map((client) => (
                <div
                  key={client.id}
                  className="group flex items-center justify-between rounded-[24px] border border-white/5 bg-brand-surfaceAlt px-4 py-4 transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-brand-text">
                      {client.nome} {client.sobrenome}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          statusClassMap[client.status] ||
                          "bg-white/5 text-brand-muted"
                        }`}
                      >
                        {client.status}
                      </span>
                      <span className="text-xs text-brand-muted">
                        {new Date(client.created_at).toLocaleDateString(
                          "pt-BR",
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleViewClient(client)}
                      variant="ghost"
                      size="sm"
                      className="min-w-[44px] px-3"
                      title="Ver cliente"
                    >
                      <Eye size={18} />
                    </Button>
                    <Button
                      onClick={() => handleEditClient(client)}
                      variant="outline"
                      size="sm"
                      className="min-w-[44px] px-3"
                      title="Editar cliente"
                    >
                      <Pencil size={18} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <ClientRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveClient}
        initialData={selectedCliente}
        parceiros={parceiros}
      />

      {isViewModalOpen && selectedCliente && (
        <ClientViewModal
          isOpen={isViewModalOpen}
          onClose={handleCloseModal}
          cliente={selectedCliente}
        />
      )}
    </div>
  );
};

export default Dashboard;
