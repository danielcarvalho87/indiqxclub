import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Reset from "./pages/Reset";
import Dashboard from "./pages/Dashboard";
import Parceiros from "./pages/Parceiros";
import Usuarios from "./pages/Usuarios";
import PrivateLayout from "./components/Layout/PrivateLayout";
import Bonificacoes from "./pages/Bonificacoes";
import Relatorios from "./pages/Relatorios";
import Clientes from "./pages/Clientes";
import MeusGanhos from "./pages/MeusGanhos";
import MeusDados from "./pages/MeusDados";
import Configuracoes from "./pages/Configuracoes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<Reset />} />

          {/* Rotas Privadas */}
          <Route element={<PrivateLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/parceiros" element={<Parceiros />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/bonificacoes" element={<Bonificacoes />} />
            <Route path="/meus-ganhos" element={<MeusGanhos />} />
            <Route path="/meus-dados" element={<MeusDados />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/usuarios" element={<Usuarios />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
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
