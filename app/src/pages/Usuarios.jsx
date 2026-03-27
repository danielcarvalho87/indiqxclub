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

const Usuarios = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const { userLevel, userId } = useAuth();

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const token = window.localStorage.getItem("token");
      const { url, options } = GET_USERS(token);
      const response = await fetch(url, options);
      if (response.ok) {
        let json = await response.json();

        // Filtragem baseada no nível de acesso
        if (userLevel === "FullAdmin" || userLevel === "Full Admin") {
          // Full Admin vê todos os usuários sem filtro
        } else if (userLevel === "Administrador") {
          // Administrador vê apenas seus próprios dados (já que não gerencia parceiros nesta tela)
          json = json.filter((user) => user.id === userId);
        } else if (userLevel === "Parceiro") {
          json = json.filter((user) => user.id === userId);
        }

        setUsuarios(json);
      } else {
        toast.error("Erro ao buscar usuários");
        console.error("Erro ao buscar usuários");
      }
    } catch (error) {
      toast.error("Erro de conexão ao buscar usuários");
      console.error("Erro na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

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
      const response = await fetch(url, options);
      if (response.ok) {
        toast.success("Usuário excluído com sucesso!");
        fetchUsuarios(); // Recarrega a lista
      } else {
        const errData = await response.json();
        toast.error(errData.message || "Erro ao excluir usuário.");
        console.error("Erro ao excluir usuário", errData);
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
        const response = await fetch(url, options);
        if (response.ok) {
          toast.success("Usuário atualizado com sucesso!");
          fetchUsuarios(); // Recarrega a lista
          handleCloseModal();
        } else {
          const errData = await response.json();
          toast.error(errData.message || "Erro ao atualizar usuário");
          console.error("Erro ao atualizar usuário", errData);
        }
      } else {
        // Modo Criação
        const { url, options } = POST_USER(userData, token);
        const response = await fetch(url, options);
        if (response.ok) {
          toast.success("Usuário criado com sucesso!");
          fetchUsuarios(); // Recarrega a lista
          handleCloseModal();
        } else {
          const errData = await response.json();
          toast.error(errData.message || "Erro ao criar usuário");
          console.error("Erro ao criar usuário", errData);
        }
      }
    } catch (error) {
      toast.error("Erro de conexão ao salvar usuário");
      console.error("Erro na requisição:", error);
    }
  };

  const filteredUsuarios = usuarios.filter((user) => {
    if (userLevel === "FullAdmin" || userLevel === "Full Admin") {
      return true; // Full Admin vê todos
    }
    return user.level === "Administrador" || user.level === "Admin";
  });

  const isFullAdmin = userLevel === "FullAdmin" || userLevel === "Full Admin";

  if (loading) {
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
              {filteredUsuarios.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="py-4 px-4 text-center text-brand-muted"
                  >
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((usuario) => (
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
            ? `Tem certeza de que deseja excluir o usuário "${userToDelete.name}"? Esta ação não pode ser desfeita.`
            : ""
        }
      />
    </div>
  );
};

export default Usuarios;
