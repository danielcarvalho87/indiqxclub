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

const Usuarios = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [paginacao, setPaginacao] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: POR_PAGINA,
  });

  const { userLevel } = useAuth();
  const buscaAtrasada = useDebounce(searchTerm, 400);

  const fetchUsuarios = async (
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
        // A API já limita ao que este usuário pode ver; esta tela mostra
        // apenas as contas administrativas.
        setUsuarios(
          json.data.filter((user) =>
            ["Administrador", "Admin", "FullAdmin", "Full Admin"].includes(
              user.level,
            ),
          ),
        );
        setPaginacao({
          page: json.page,
          totalPages: json.totalPages,
          total: json.total,
          limit: json.limit,
        });
      } else {
        toast.error(await mensagemDeErro(response, "Erro ao buscar usuários"));
      }
    } catch (error) {
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios(1, buscaAtrasada);
  }, [buscaAtrasada]);

  const irParaPagina = (pagina) => {
    if (pagina < 1 || pagina > paginacao.totalPages) return;
    fetchUsuarios(pagina, buscaAtrasada);
  };

  const handleOpenModal = (user = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleOpenConfirmDelete = (user) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const handleCloseConfirmDelete = () => {
    setUserToDelete(null);
    setIsConfirmModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    const token = window.localStorage.getItem("token");
    const { url, options } = DELETE_USER(userToDelete.id, token);

    try {
      const response = await apiFetch(url, options);
      if (response.ok) {
        toast.success("Usuário excluído com sucesso!");
        const paginaAlvo =
          usuarios.length === 1 && paginacao.page > 1
            ? paginacao.page - 1
            : paginacao.page;
        fetchUsuarios(paginaAlvo, buscaAtrasada);
      } else {
        toast.error(await mensagemDeErro(response, "Erro ao excluir usuário."));
      }
    } catch (error) {
      toast.error("Erro de conexão ao excluir usuário.");
      console.error("Erro na requisição de exclusão:", error);
    } finally {
      handleCloseConfirmDelete();
    }
  };

  const handleSaveUser = async (userData) => {
    const token = window.localStorage.getItem("token");

    try {
      if (selectedUser) {
        // Modo Edição
        const { url, options } = PUT_USER(selectedUser.id, userData, token);
        const response = await apiFetch(url, options);
        if (response.ok) {
          toast.success("Usuário atualizado com sucesso!");
          fetchUsuarios(paginacao.page, buscaAtrasada);
          handleCloseModal();
        } else {
          toast.error(
            await mensagemDeErro(response, "Erro ao atualizar usuário"),
          );
        }
      } else {
        // Modo Criação
        const { url, options } = POST_USER(userData, token);
        const response = await apiFetch(url, options);
        if (response.ok) {
          toast.success("Usuário criado com sucesso!");
          fetchUsuarios(1, buscaAtrasada);
          handleCloseModal();
        } else {
          toast.error(await mensagemDeErro(response, "Erro ao criar usuário"));
        }
      }
    } catch (error) {
      toast.error("Erro de conexão ao salvar usuário");
      console.error("Erro na requisição:", error);
    }
  };

  const isFullAdmin = userLevel === "FullAdmin" || userLevel === "Full Admin";

  if (loading && usuarios.length === 0 && !buscaAtrasada) {
    return <LoadingSpinner fullScreen message="Carregando usuários..." />;
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4 md:gap-0">
        <h1 className="text-3xl font-bold text-brand-text">
          {isFullAdmin ? "Usuários" : "Meus Dados"}
        </h1>
        {isFullAdmin && (
          <Button onClick={() => handleOpenModal()}>Novo Usuário</Button>
        )}
      </div>

      {isFullAdmin && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por nome, e-mail ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Buscar usuários"
            className="w-full md:w-1/3 px-4 py-2 bg-brand-surface border border-brand-border rounded-md text-brand-text focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
        </div>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-brand-border text-brand-muted">
                <th className="py-3 px-4">Nome</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Perfil</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-4 px-4 text-center text-brand-muted"
                  >
                    {loading
                      ? "Carregando..."
                      : buscaAtrasada
                        ? `Nenhum usuário encontrado para "${buscaAtrasada}".`
                        : "Nenhum usuário cadastrado ainda."}
                  </td>
                </tr>
              ) : (
                usuarios.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="border-b border-brand-border hover:bg-brand-dark/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium text-brand-text">
                      {usuario.name} {usuario.sobrenome || ""}
                    </td>
                    <td className="py-4 px-4 text-brand-muted">
                      {usuario.email}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          usuario.level === "Administrador" ||
                          usuario.level === "Admin"
                            ? "bg-purple-900/30 text-purple-400"
                            : usuario.level === "Parceiro"
                              ? "bg-blue-900/30 text-blue-400"
                              : "bg-brand-border text-brand-muted"
                        }`}
                      >
                        {usuario.level || "Não definido"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          usuario.status === "Ativo"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {usuario.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleOpenModal(usuario)}
                          variant="outline"
                          size="sm"
                          className="min-w-[42px] px-3"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </Button>
                        {isFullAdmin && (
                          <Button
                            onClick={() => handleOpenConfirmDelete(usuario)}
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

        <Pagination
          page={paginacao.page}
          totalPages={paginacao.totalPages}
          total={paginacao.total}
          limit={paginacao.limit}
          onPageChange={irParaPagina}
          label="usuários"
        />
      </Card>

      {/* Renderiza o modal com isParceiro = false (padrão) -> Apenas campos essenciais e nível Administrador */}
      <UserRegistrationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSaveUser}
        initialData={selectedUser}
        isParceiro={userLevel === "Parceiro"}
        currentUserLevel={userLevel}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Usuário"
        message={
          userToDelete
            ? `Você está prestes a excluir o usuário "${userToDelete.name} ${userToDelete.sobrenome || ""}".`.trim()
            : ""
        }
        warning="Os parceiros vinculados a este administrador ficam sem empresa responsável. Considere alterar o status para Inativo em vez de excluir."
        confirmationText={userToDelete?.name}
      />
    </div>
  );
};

export default Usuarios;
