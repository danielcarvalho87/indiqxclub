import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import BonificacaoRegistrationModal from "../components/Modals/BonificacaoRegistrationModal";
import ConfirmModal from "../components/Modals/ConfirmModal";
import {
  GET_BONIFICACOES,
  POST_BONIFICACAO,
  PUT_BONIFICACAO,
  DELETE_BONIFICACAO,
} from "../api";
import { useAuth } from "../hooks/useAuth";

import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const Bonificacoes = () => {
  const [bonificacoes, setBonificacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedBonificacao, setSelectedBonificacao] = useState(null);
  const [bonificacaoToDelete, setBonificacaoToDelete] = useState(null);

  const { userLevel, userId } = useAuth();

  const fetchBonificacoes = async () => {
    try {
      const token = window.localStorage.getItem("token");
      const { url, options } = GET_BONIFICACOES(token);
      const response = await fetch(url, options);
      if (response.ok) {
        let json = await response.json();

        // Filtragem baseada no nível de acesso
        if (userLevel === "FullAdmin" || userLevel === "Full Admin") {
          // Full Admin vê todas as bonificações
        } else if (userLevel === "Administrador" || userLevel === "Admin") {
          // Administrador vê apenas as bonificações que ele mesmo cadastrou (baseado no master_id ou id dele)
          json = json.filter(
            (item) => item.master_id === userId || item.userId === userId,
          );
        }

        setBonificacoes(json);
      } else {
        toast.error("Erro ao carregar bonificações.");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonificacoes();
  }, []);

  const handleOpenModal = (bonificacao = null) => {
    setSelectedBonificacao(bonificacao);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBonificacao(null);
  };

  const handleOpenConfirmDelete = (bonificacao) => {
    setBonificacaoToDelete(bonificacao);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmDelete = () => {
    setIsConfirmModalOpen(false);
    setBonificacaoToDelete(null);
  };

  const handleSaveBonificacao = async (data) => {
    const token = window.localStorage.getItem("token");
    try {
      if (selectedBonificacao) {
        const { url, options } = PUT_BONIFICACAO(
          selectedBonificacao.id,
          data,
          token,
        );
        const response = await fetch(url, options);
        if (response.ok) {
          toast.success("Bonificação atualizada com sucesso!");
          fetchBonificacoes();
          handleCloseModal();
        } else {
          toast.error("Erro ao atualizar bonificação.");
        }
      } else {
        const { url, options } = POST_BONIFICACAO(data, token);
        const response = await fetch(url, options);
        if (response.ok) {
          toast.success("Bonificação criada com sucesso!");
          fetchBonificacoes();
          handleCloseModal();
        } else {
          toast.error("Erro ao criar bonificação.");
        }
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro de conexão.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!bonificacaoToDelete) return;
    const token = window.localStorage.getItem("token");
    try {
      const { url, options } = DELETE_BONIFICACAO(
        bonificacaoToDelete.id,
        token,
      );
      const response = await fetch(url, options);
      if (response.ok) {
        toast.success("Bonificação excluída com sucesso!");
        fetchBonificacoes();
        handleCloseConfirmDelete();
      } else {
        toast.error("Erro ao excluir bonificação.");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro de conexão.");
    }
  };

  const filteredBonificacoes = bonificacoes.filter(
    (item) =>
      item.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descricao.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando bonificações..." />;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
        <h1 className="text-3xl font-bold text-brand-text">Bonificações</h1>
        <Button onClick={() => handleOpenModal()}>
          <Plus size={20} className="mr-2" /> Nova Bonificação
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative w-full md:w-1/3">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-brand-muted"
          />
          <input
            type="text"
            placeholder="Buscar por título ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-brand-surface border border-brand-border rounded-md text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted">
                <th className="py-3 px-4">Título</th>
                <th className="py-3 px-4">Descrição</th>
                <th className="py-3 px-4">Pontuação</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredBonificacoes.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-brand-muted">
                    Nenhuma bonificação encontrada.
                  </td>
                </tr>
              ) : (
                filteredBonificacoes.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-brand-border hover:bg-brand-dark/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-brand-text font-medium">
                      {item.titulo}
                    </td>
                    <td
                      className="py-4 px-4 text-brand-muted max-w-xs truncate"
                      title={item.descricao}
                    >
                      {item.descricao}
                    </td>
                    <td className="py-4 px-4 text-brand-primary font-bold">
                      {item.pontuacao} pts
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.status === "Ativo"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleOpenModal(item)}
                          variant="outline"
                          size="sm"
                          className="min-w-[42px] px-3"
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button
                          onClick={() => handleOpenConfirmDelete(item)}
                          variant="danger"
                          size="sm"
                          className="min-w-[42px] px-3"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <BonificacaoRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveBonificacao}
        initialData={selectedBonificacao}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Bonificação"
        message={`Tem certeza que deseja excluir a bonificação "${bonificacaoToDelete?.titulo}"?`}
      />
    </div>
  );
};

export default Bonificacoes;
