import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Pencil, Trash2 } from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import UserRegistrationModal from "../components/Modals/UserRegistrationModal";
import ConfirmModal from "../components/Modals/ConfirmModal";
import { GET_USERS_PAGINADO, POST_USER, PUT_USER, DELETE_USER } from "../api";
import { useAuth } from "../hooks/useAuth";
import { apiFetch, mensagemDeErro } from "../lib/http";
import { useDebounce } from "../hooks/useDebounce";
import { Pagination } from "../components/ui/Pagination";

import { LoadingSpinner } from "../components/ui/LoadingSpinner";

const POR_PAGINA = 20;

const Parceiros = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [parceiros, setParceiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParceiro, setSelectedParceiro] = useState(null);
  const [parceiroToDelete, setParceiroToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paginacao, setPaginacao] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: POR_PAGINA,
  });

  const { userLevel, userId } = useAuth();
  const buscaAtrasada = useDebounce(searchTerm, 400);

  const fetchParceiros = async (
    pagina = paginacao.page,
    busca = buscaAtrasada,
  ) => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("token");
      const { url, options } = GET_USERS_PAGINADO(
        { page: pagina, limit: POR_PAGINA, search: busca },
        token,
      );
      const response = await apiFetch(url, options);

      if (response.ok) {
        const json = await response.json();
        // O recorte por empresa já vem da API; aqui resta apenas separar
        // os parceiros dos administradores.
        setParceiros(
          json.data.filter(
            (user) => user.level === "Parceiro" || user.level === "parceiro",
          ),
        );
        setPaginacao({
          page: json.page,
          totalPages: json.totalPages,
          total: json.total,
          limit: json.limit,
        });
      } else {
        toast.error(await mensagemDeErro(response, "Erro ao buscar parceiros"));
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParceiros(1, buscaAtrasada);
  }, [buscaAtrasada]);

  const irParaPagina = (pagina) => {
    if (pagina < 1 || pagina > paginacao.totalPages) return;
    fetchParceiros(pagina, buscaAtrasada);
  };

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
      const response = await apiFetch(url, options);
      if (response.ok) {
        toast.success("Parceiro excluído com sucesso!");
        const paginaAlvo =
          parceiros.length === 1 && paginacao.page > 1
            ? paginacao.page - 1
            : paginacao.page;
        fetchParceiros(paginaAlvo, buscaAtrasada);
      } else {
        toast.error(await mensagemDeErro(response, "Erro ao excluir parceiro."));
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
        const response = await apiFetch(url, options);
        if (response.ok) {
          toast.success("Parceiro atualizado com sucesso!");
          fetchParceiros(paginacao.page, buscaAtrasada);
          handleCloseModal();
        } else {
          toast.error(
            await mensagemDeErro(response, "Erro ao atualizar parceiro"),
          );
        }
      } else {
        // Modo Criação
        const { url, options } = POST_USER(userData, token);
        const response = await apiFetch(url, options);
        if (response.ok) {
          toast.success("Parceiro criado com sucesso!");
          fetchParceiros(1, buscaAtrasada);
          handleCloseModal();
        } else {
          toast.error(await mensagemDeErro(response, "Erro ao criar parceiro"));
        }
      }
    } catch (error) {
      toast.error("Erro de conexão ao salvar parceiro");
      console.error("Erro na requisição:", error);
    }
  };

  if (loading && parceiros.length === 0 && !buscaAtrasada) {
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
              {parceiros.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-4 px-4 text-center text-brand-muted"
                  >
                    {loading
                      ? "Carregando..."
                      : buscaAtrasada
                        ? `Nenhum parceiro encontrado para "${buscaAtrasada}".`
                        : "Nenhum parceiro cadastrado ainda."}
                  </td>
                </tr>
              ) : (
                parceiros.map((parceiro) => (
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

        <Pagination
          page={paginacao.page}
          totalPages={paginacao.totalPages}
          total={paginacao.total}
          limit={paginacao.limit}
          onPageChange={irParaPagina}
          label="parceiros"
        />
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
            ? `Você está prestes a excluir o parceiro "${parceiroToDelete.name} ${parceiroToDelete.sobrenome || ""}".`.trim()
            : ""
        }
        warning="Os clientes indicados por este parceiro perdem o vínculo e o histórico de comissões dele deixa de ser recuperável. Considere alterar o status para Inativo em vez de excluir."
        confirmationText={parceiroToDelete?.name}
      />
    </div>
  );
};

export default Parceiros;
