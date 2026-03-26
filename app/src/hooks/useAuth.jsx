import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return {
    ...context,
  };
};

// Hook para verificar permissões específicas
export function usePermission(requiredLevel) {
  const { userLevel, isAuthenticated } = useAuth();

  // Hierarquia de níveis (ajuste conforme sua aplicação)
  const levelHierarchy = {
    admin: 1,
    master: 2,
    manager: 3,
  };

  const hasPermission = () => {
    if (!isAuthenticated()) return false;

    const currentLevel = levelHierarchy[userLevel?.toLowerCase()] || 0;
    const required = levelHierarchy[requiredLevel?.toLowerCase()] || 0;

    return currentLevel >= required;
  };

  return {
    hasPermission: hasPermission(),
    userLevel,
    isAuthenticated: isAuthenticated(),
  };
}

// Hook para proteger rotas
export function useProtectedRoute(redirectTo = "/login") {
  const { isAuthenticated, loading, isInitialized } = useAuth();

  // Retorna o estado de carregamento e autenticação
  return {
    isLoading: loading || !isInitialized,
    isAuthenticated: isAuthenticated(),
    shouldRedirect: isInitialized && !loading && !isAuthenticated(),
    redirectTo,
  };
}

// Hook para gerenciar formulário de login
export function useLoginForm() {
  const { userLogin, error, loading } = useAuth();

  const handleLogin = async (email, password) => {
    // Validação básica
    if (!email || !password) {
      return {
        success: false,
        error: "Email e senha são obrigatórios",
      };
    }

    const success = await userLogin(email, password);

    return {
      success,
      error: success ? null : error,
    };
  };

  return {
    handleLogin,
    isLoading: loading,
    error,
  };
}
