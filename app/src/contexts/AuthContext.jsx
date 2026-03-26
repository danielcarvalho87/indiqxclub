import { useState, useEffect, createContext } from "react";
import { useNavigate } from "react-router-dom";
import { TOKEN_POST, GET_USER } from "./../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  const WARNING_DURATION = 5 * 60 * 1000; // 5 minutes

  const [showSessionWarning, setShowSessionWarning] = useState(false);

  const [authState, setAuthState] = useState(() => {
    // Recupera o estado do localStorage se existir
    const savedState = localStorage.getItem("authState");
    return savedState
      ? JSON.parse(savedState)
      : {
          data: null,
          login: false,
          loading: true,
          error: null,
          userId: null,
          userLevel: null,
          masterId: null,
          userStatus: null,
        };
  });

  // Função para salvar o estado no localStorage
  const saveAuthState = (newState) => {
    localStorage.setItem("authState", JSON.stringify(newState));
    setAuthState(newState);
  };

  const updateSessionExpiry = () => {
    const expiryTime = Date.now() + SESSION_DURATION;
    localStorage.setItem("sessionExpiry", expiryTime.toString());
    setShowSessionWarning(false);
  };

  const checkSession = () => {
    const expiryTime = localStorage.getItem("sessionExpiry");
    if (!expiryTime) return;

    const timeLeft = parseInt(expiryTime) - Date.now();

    if (timeLeft <= 0) {
      userLogout();
    } else if (timeLeft <= WARNING_DURATION) {
      setShowSessionWarning(true);
    } else {
      setShowSessionWarning(false);
    }
  };

  useEffect(() => {
    // Verificar sessão a cada 30 segundos
    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, []);

  async function getUser(token) {
    try {
      const { url, options } = GET_USER(token);
      const response = await fetch(url, options);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      // Alternativamente, você pode decodificar o token diretamente:
      const decodedToken = JSON.parse(atob(token.split(".")[1]));
      const masterId = decodedToken.master_id;

      // Capturar o status de diferentes formas possíveis
      const userStatus =
        json.status ||
        json.user_status ||
        json.userStatus ||
        json.user?.status ||
        json.user?.user_status ||
        "Ativo"; // fallback

      const newState = {
        data: json,
        login: true,
        loading: false,
        error: null,
        // Tenta diferentes propriedades possíveis para o ID
        userId:
          json.id ||
          json.user_id ||
          json.userId ||
          json.user?.id ||
          json.user?.user_id ||
          decodedToken.sub ||
          decodedToken.user_id ||
          null,
        userLevel:
          json.level ||
          json.user_level ||
          json.userLevel ||
          json.user?.level ||
          json.user?.user_level ||
          null,
        masterId: json.master_id || json.user?.master_id || masterId || null,
        userStatus: userStatus,
      };

      saveAuthState(newState);
      return newState;
    } catch (err) {
      console.error("Erro ao carregar dados do usuário:", err);

      // Usar função callback para garantir estado atual
      setAuthState((prevState) => {
        const newState = {
          ...prevState,
          loading: false,
          error: err.message || "Falha ao carregar dados do usuário",
        };
        localStorage.setItem("authState", JSON.stringify(newState));
        return newState;
      });
      throw err;
    }
  }

  async function userLogin(email, password) {
    try {
      // Usar função callback para garantir estado atual
      setAuthState((prevState) => {
        const newState = { ...prevState, loading: true, error: null };
        localStorage.setItem("authState", JSON.stringify(newState));
        return newState;
      });

      const { url, options } = TOKEN_POST({
        email: typeof email === "object" ? email.value : email,
        password: typeof password === "object" ? password.value : password,
      });

      const response = await fetch(url, options);
      const json = await response.json();

      if (response.ok) {
        // PRIMEIRA VERIFICAÇÃO: Verificar status diretamente na resposta do login
        if (json.user && json.user.status !== "Ativo") {
          setAuthState((prevState) => {
            const newState = {
              ...prevState,
              loading: false,
              error: "Usuário inativo. Entre em contato com o suporte.",
            };
            localStorage.setItem("authState", JSON.stringify(newState));
            return newState;
          });

          return false;
        }

        localStorage.setItem("token", json.access_token);

        // Buscar dados do usuário
        const userData = await getUser(json.access_token);

        // SEGUNDA VERIFICAÇÃO: Verificar se o usuário está ativo com comparação rigorosa
        const userStatus = userData.userStatus;

        // Verificar diferentes variações possíveis do status
        if (
          userStatus !== "Ativo" &&
          userStatus !== "ativo" &&
          userStatus !== "ATIVO"
        ) {
          // Se usuário não está ativo, fazer logout e retornar erro
          userLogout();

          setAuthState((prevState) => {
            const newState = {
              ...prevState,
              loading: false,
              error: "Usuário inativo. Entre em contato com o suporte.",
            };
            localStorage.setItem("authState", JSON.stringify(newState));
            return newState;
          });

          return false;
        }

        // REDIRECIONAMENTO ADICIONADO AQUI
        if (
          userData.userLevel === "Parceiro" ||
          userData.userLevel === "parceiro"
        ) {
          navigate("/meus-ganhos");
        } else {
          navigate("/dashboard");
        }

        // Definir tempo de expiração da sessão
        updateSessionExpiry();

        return true;
      } else {
        throw new Error(json.message || "Login falhou");
      }
    } catch (err) {
      console.error("Erro no login:", err);

      setAuthState((prevState) => {
        const newState = {
          ...prevState,
          loading: false,
          error: err.message,
        };
        localStorage.setItem("authState", JSON.stringify(newState));
        return newState;
      });
      return false;
    }
  }

  function userLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("authState");
    localStorage.removeItem("sessionExpiry");
    setShowSessionWarning(false);
    const newState = {
      data: null,
      login: false,
      loading: false,
      error: null,
      userId: null,
      userLevel: null,
      masterId: null,
      userStatus: null,
    };
    saveAuthState(newState);
    navigate("/login");
  }

  useEffect(() => {
    const autoLogin = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await getUser(token);

          // Verificar se o usuário ainda está ativo no auto-login
          if (userData.userStatus !== "Ativo") {
            userLogout();
          }
        } catch (err) {
          console.error("Erro no auto-login:", err);
          userLogout();
        }
      } else {
        setAuthState((prevState) => {
          const newState = { ...prevState, loading: false };
          localStorage.setItem("authState", JSON.stringify(newState));
          return newState;
        });
      }
    };

    autoLogin();
  }, []);

  async function signInWithToken(token) {
    try {
      localStorage.setItem("token", token);
      const userData = await getUser(token);
      updateSessionExpiry();

      if (
        userData.userLevel === "Parceiro" ||
        userData.userLevel === "parceiro"
      ) {
        navigate("/meus-ganhos");
      } else {
        navigate("/dashboard");
      }
      return true;
    } catch (err) {
      console.error("Erro no login via token:", err);
      userLogout();
      return false;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        isAuthenticated: () => authState.login,
        isInitialized: !authState.loading,
        userLogin,
        userLogout,
        signInWithToken,
        showSessionWarning,
        renewSession: updateSessionExpiry,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
