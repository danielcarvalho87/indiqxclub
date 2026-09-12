import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PrivateLayout from "./components/Layout/PrivateLayout";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

// Só a landing e o login entram no pacote inicial. O resto é carregado
// sob demanda: quem cai na home não baixa o painel nem os formulários
// de cadastro e recuperação de senha.
const Register = lazy(() => import("./pages/Register"));
const Reset = lazy(() => import("./pages/Reset"));
const ConfirmEmail = lazy(() => import("./pages/ConfirmEmail"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Parceiros = lazy(() => import("./pages/Parceiros"));
const Usuarios = lazy(() => import("./pages/Usuarios"));
const Bonificacoes = lazy(() => import("./pages/Bonificacoes"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Clientes = lazy(() => import("./pages/Clientes"));
const MeusGanhos = lazy(() => import("./pages/MeusGanhos"));
const MeusDados = lazy(() => import("./pages/MeusDados"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Planos = lazy(() => import("./pages/Planos"));
const Assinatura = lazy(() => import("./pages/Assinatura"));

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/register"
            element={
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Register />
              </Suspense>
            }
          />
          <Route
            path="/reset"
            element={
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <Reset />
              </Suspense>
            }
          />
          <Route
            path="/confirm-email"
            element={
              <Suspense fallback={<LoadingSpinner fullScreen />}>
                <ConfirmEmail />
              </Suspense>
            }
          />

          {/* Rotas Privadas */}
          <Route
            element={
              <Suspense
                fallback={<LoadingSpinner fullScreen message="Carregando..." />}
              >
                <PrivateLayout />
              </Suspense>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/parceiros" element={<Parceiros />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/bonificacoes" element={<Bonificacoes />} />
            <Route path="/meus-ganhos" element={<MeusGanhos />} />
            <Route path="/meus-dados" element={<MeusDados />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/planos" element={<Planos />} />
            <Route path="/assinatura" element={<Assinatura />} />
          </Route>

          {/* Redirecionar qualquer outra rota para login */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </BrowserRouter>
  );
}

export default App;
