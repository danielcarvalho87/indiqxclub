import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import UserRegistrationModal from "../components/Modals/UserRegistrationModal";
import ConfirmModal from "../components/Modals/ConfirmModal";
import { GET_USERS, POST_USER, PUT_USER, DELETE_USER } from "../api";
import { useAuth } from "../hooks/useAuth";

import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const Parceiros = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParceiro, setSelectedParceiro] = useState(null);
  const [parceiroToDelete, setParceiroToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { userLevel, userId } = useAuth();

  const fetchParceiros = async () => {
    setLoading(true);
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

        if (userLevel === "FullAdmin" || userLevel === "Full Admin") {
          // FullAdmin vê todos os parceiros
        } else if (userLevel === "Administrador" || userLevel === "Admin") {
          // Administrador vê apenas os parceiros que ele cadastrou (master_id igual ao id dele)
          apenasParceiros = apenasParceiros.filter(
            (user) => user.master_id === userId,
          );
        }

        setParceiros(apenasParceiros);
      } else {
        toast.error("Erro ao buscar parceiros");
        console.error("Erro ao buscar parceiros");
      }
    } catch (error) {
      toast.error("Erro de conexão ao buscar parceiros");
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParceiros();
  }, []);

  const handleOpenModal = (parceiro = null) => {
    setSelectedParceiro(parceiro);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedParceiro(null);
    setIsModalOpen(false);
  };

  const handleOpenConfirmDelete = (parceiro) => {
    setParceiroToDelete(parceiro);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmDelete = () => {
    setParceiroToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!parceiroToDelete) return;

    const token = window.localStorage.getItem("token");
    const { url, options } = DELETE_USER(parceiroToDelete.id, token);

    try {
      const response = await fetch(url, options);
      if (response.ok) {
        toast.success("Parceiro excluído com sucesso!");
        fetchParceiros(); // Recarrega a lista
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Erro ao excluir parceiro.");
        console.error("Erro ao excluir parceiro", errData);
      }
    } catch (error) {
      toast.error("Erro de conexão ao excluir parceiro.");
      console.error("Erro na requisição de exclusão:", error);
    } finally {
      handleCloseConfirmDelete();
    }
  };

  const handleSaveParceiro = async (userData) => {
    const token = window.localStorage.getItem("token");

    try {
      if (selectedParceiro) {
        // Modo Edição
        const { url, options } = PUT_USER(selectedParceiro.id, userData, token);
        const response = await fetch(url, options);
        if (response.ok) {
          toast.success("Parceiro atualizado com sucesso!");
          fetchParceiros(); // Recarrega a lista
          handleCloseModal();
        } else {
          const errData = await response.json();
          toast.error(errData.message || "Erro ao atualizar parceiro");
          console.error("Erro ao atualizar parceiro", errData);
        }
      } else {
        // Modo Criação
        const { url, options } = POST_USER(userData, token);
        const response = await fetch(url, options);
        if (response.ok) {
          toast.success("Parceiro criado com sucesso!");
          fetchParceiros(); // Recarrega a lista
          handleCloseModal();
        } else {
          const errData = await response.json();
          toast.error(errData.message || "Erro ao criar parceiro");
          console.error("Erro ao criar parceiro", errData);
        }
      }
    } catch (error) {
      toast.error("Erro de conexão ao salvar parceiro");
      console.error("Erro na requisição:", error);
    }
  };

  const filteredParceiros = parceiros.filter((parceiro) => {
    const matchName = parceiro.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchEmail = parceiro.email
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchCpf = parceiro.cpf?.includes(searchTerm);
    return matchName || matchEmail || matchCpf;
  });

  if (loading) {
    return <LoadingSpinner fullScreen message="Carregando parceiros..." />;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
        <h1 className="text-3xl font-bold text-brand-text">Parceiros</h1>
        <Button onClick={() => handleOpenModal()}>Novo Parceiro</Button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar parceiro por nome, email ou CPF..."
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
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Telefone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredParceiros.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-4 px-4 text-center text-brand-muted"
                  >
                    Nenhum parceiro encontrado.
                  </td>
                </tr>
              ) : (
                filteredParceiros.map((parceiro) => (
                  <tr
                    key={parceiro.id}
                    className="border-b border-brand-border hover:bg-brand-dark/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-brand-text">
                      {parceiro.name} {parceiro.sobrenome || ""}
                    </td>
                    <td className="py-4 px-4 text-brand-muted">
                      {parceiro.email}
                    </td>
                    <td className="py-4 px-4 text-brand-muted">
                      {parceiro.telefone || "-"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          parceiro.status === "Ativo"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {parceiro.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleOpenModal(parceiro)}
                          variant="outline"
                          size="sm"
                          className="min-w-[42px] px-3"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </Button>
                        <Button
                          onClick={() => handleOpenConfirmDelete(parceiro)}
                          variant="danger"
                          size="sm"
                          className="min-w-[42px] px-3"
                          title="Excluir"
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

      <UserRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveParceiro}
        isParceiro={true}
        initialData={selectedParceiro}
        currentUserLevel={userLevel}
        currentUserId={userId}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Parceiro"
        message={
          parceiroToDelete
            ? `Tem certeza de que deseja excluir o parceiro "${parceiroToDelete.name}"? Esta ação não pode ser desfeita.`
            : ""
        }
      />
    </div>
  );
};

export default Parceiros;
