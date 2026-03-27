import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Pencil, Trash2, Eye } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import ClientRegistrationModal from "../components/Modals/ClientRegistrationModal";
import ConfirmModal from "../components/Modals/ConfirmModal";
import ClientViewModal from "../components/Modals/ClientViewModal";
import {
  GET_CLIENTES,
  POST_CLIENTE,
  PUT_CLIENTE,
  DELETE_CLIENTE,
  GET_USERS,
} from "../api";
import { useAuth } from "../hooks/useAuth";

import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const Clientes = () => {
  const { userLevel, userId } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [clienteToDelete, setClienteToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [clientToView, setClientToView] = useState(null);

  const fetchMyPartners = async () => {
    try {
      const token = window.localStorage.getItem("token");
      const { url, options } = GET_USERS(token);
      const response = await fetch(url, options);
      if (response.ok) {
        const json = await response.json();
        return json.filter(
          (user) =>
            (user.level === "Parceiro" || user.level === "parceiro") &&
            user.master_id === userId,
        );
      }
    } catch (error) {
      console.error("Erro ao buscar parceiros para filtro:", error);
    }
    return [];
  };

  const fetchClientes = async () => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("token");
      const { url, options } = GET_CLIENTES(token);
      const response = await fetch(url, options);
      if (response.ok) {
        let json = await response.json();

        // Filter for Parceiro
        if (userLevel === "Parceiro" || userLevel === "parceiro") {
          json = json.filter((c) => {
            const cId = c.corretor?.id || c.corretor_id;
            return String(cId) === String(userId);
          });
        } else if (userLevel === "Administrador") {
          // Filtrar clientes do próprio admin e dos seus parceiros
          const myPartners = await fetchMyPartners();
          const validIds = [
            String(userId),
            ...myPartners.map((p) => String(p.id)),
          ];
          json = json.filter((c) => {
            const cId = c.corretor?.id || c.corretor_id;
            return validIds.includes(String(cId));
          });
        }

        setClientes(json);
      } else {
        toast.error("Erro ao buscar clientes");
        console.error("Erro ao buscar clientes");
      }
    } catch (error) {
      toast.error("Erro de conexão ao buscar clientes");
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParceiros = async () => {
    try {
      const token = window.localStorage.getItem("token");
      const { url, options } = GET_USERS(token);
      const response = await fetch(url, options);
      if (response.ok) {
        const json = await response.json();
        // Filtrar apenas os que têm level 'Parceiro'
        let apenasParceiros = json.filter(
          (user) => user.level === "Parceiro" || user.level === "parceiro",
        );

        if (userLevel === "Administrador") {
          apenasParceiros = apenasParceiros.filter(
            (user) => user.master_id === userId,
          );
        }

        setParceiros(apenasParceiros);
      }
    } catch (error) {
      console.error("Erro ao buscar parceiros:", error);
    }
  };

  useEffect(() => {
    fetchClientes();
    fetchParceiros();
  }, []);

  const handleOpenModal = (cliente = null) => {
    setSelectedCliente(cliente);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCliente(null);
    setIsModalOpen(false);
  };

  const handleOpenConfirmDelete = (cliente) => {
    setClienteToDelete(cliente);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmDelete = () => {
    setClienteToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!clienteToDelete) return;

    const token = window.localStorage.getItem("token");
    const { url, options } = DELETE_CLIENTE(clienteToDelete.id, token);

    try {
      const response = await fetch(url, options);
      if (response.ok) {
        toast.success("Cliente excluído com sucesso!");
        fetchClientes();
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Erro ao excluir cliente.");
      }
    } catch (error) {
      toast.error("Erro de conexão ao excluir cliente.");
    } finally {
      handleCloseConfirmDelete();
    }
  };

  const handleOpenViewModal = (cliente) => {
    setClientToView(cliente);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setClientToView(null);
    setIsViewModalOpen(false);
  };

  const handleSaveCliente = async (clienteData) => {
    const token = window.localStorage.getItem("token");

    try {
      if (selectedCliente) {
        // Edição
        const { url, options } = PUT_CLIENTE(
          selectedCliente.id,
          clienteData,
          token,
        );
        const response = await fetch(url, options);
        if (response.ok) {
          toast.success("Cliente atualizado com sucesso!");
          fetchClientes();
          handleCloseModal();
        } else {
          const errData = await response.json();
          toast.error(errData.message || "Erro ao atualizar cliente.");
        }
      } else {
        // Criação
        const { url, options } = POST_CLIENTE(clienteData, token);
        const response = await fetch(url, options);
        if (response.ok) {
          toast.success("Cliente cadastrado com sucesso!");
          fetchClientes();
          handleCloseModal();
        } else {
          const errData = await response.json();
          toast.error(errData.message || "Erro ao criar cliente.");
        }
      }
    } catch (error) {
      toast.error("Erro de conexão ao salvar cliente.");
      console.error("Erro na requisição:", error);
    }
  };

  const filteredClientes = clientes.filter((cliente) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchName = `${cliente.nome} ${cliente.sobrenome || ""}`
      .toLowerCase()
      .includes(searchTermLower);
    const matchEmail = cliente.email?.toLowerCase().includes(searchTermLower);
    const matchTelefone = cliente.telefone?.includes(searchTerm);
    const matchParceiro = cliente.corretor
      ? `${cliente.corretor.name} ${cliente.corretor.sobrenome || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      : false;

    return matchName || matchEmail || matchTelefone || matchParceiro;
  });

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando clientes..." />;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
        <h1 className="text-3xl font-bold text-brand-text">Clientes</h1>
        <Button onClick={() => handleOpenModal()}>Novo Cliente</Button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar cliente por nome, email, telefone ou parceiro..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 bg-brand-surface border border-brand-border rounded-md text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
        />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted">
                <th className="py-3 px-4">Nome do Cliente</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4">Parceiro</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-brand-muted">
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-brand-border hover:bg-brand-dark/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-brand-text">
                      {cliente.nome} {cliente.sobrenome}
                    </td>
                    <td className="py-4 px-4 text-brand-muted">
                      {cliente.telefone ? (
                        <a
                          href={`https://wa.me/55${cliente.telefone.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-primary hover:underline"
                          title="Chamar no WhatsApp"
                        >
                          {cliente.telefone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="py-4 px-4 text-brand-muted">
                      <span className="text-brand-muted">
                        {cliente.corretor?.name}{" "}
                        {cliente.corretor?.sobrenome || ""}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          cliente.status === "Novo cliente"
                            ? "bg-blue-900/30 text-blue-400"
                            : cliente.status === "Em atendimento"
                              ? "bg-yellow-900/30 text-yellow-400"
                              : cliente.status === "Reunião agendada"
                                ? "bg-purple-900/30 text-purple-400"
                                : cliente.status === "Contrato fechado"
                                  ? "bg-green-900/30 text-green-400"
                                  : cliente.status === "Contrato perdido"
                                    ? "bg-red-900/30 text-red-400"
                                    : "bg-brand-surface/30 text-brand-muted"
                        }`}
                      >
                        {cliente.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleOpenViewModal(cliente)}
                          variant="outline"
                          size="sm"
                          className="min-w-[42px] px-3 text-blue-300 hover:border-blue-400/40 hover:bg-blue-400/10"
                          title="Visualizar Detalhes"
                        >
                          <Eye size={18} />
                        </Button>
                        <Button
                          onClick={() => handleOpenModal(cliente)}
                          variant="outline"
                          size="sm"
                          className="min-w-[42px] px-3"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </Button>
                        {userLevel !== "Parceiro" && (
                          <Button
                            onClick={() => handleOpenConfirmDelete(cliente)}
                            variant="danger"
                            size="sm"
                            className="min-w-[42px] px-3"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ClientRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveCliente}
        initialData={selectedCliente}
        parceiros={parceiros}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir o cliente ${clienteToDelete?.nome}? Esta ação não pode ser desfeita.`}
      />

      <ClientViewModal
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
        cliente={clientToView}
      />
    </div>
  );
};

export default Clientes;
