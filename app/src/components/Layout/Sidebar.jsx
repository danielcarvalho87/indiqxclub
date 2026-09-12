import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  User,
  Settings,
  LogOut,
  Ticket,
  BarChart,
  X,
  ListPlus,
  TrendingUp,
  CreditCard,
  Receipt,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import logoIndiqx from "../../assets/indiqx-logo-w.png";
import { podeAcessarRota } from "../../utils/permissoes";
import { ehParceiro } from "../../utils/level";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { userLogout, userLevel, data } = useAuth();
  const location = useLocation();
  const userName = [data?.name, data?.sobrenome].filter(Boolean).join(" ");

  // Ordem de exibição. Quem vê cada item sai de ACESSO_POR_ROTA, a mesma
  // regra que o PrivateLayout aplica na URL — antes o menu tinha uma lista
  // própria de papéis ("master", "manager") e ela divergia da API.
  const allMenuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Meus Ganhos", icon: TrendingUp, path: "/meus-ganhos" },
    { name: "Parceiros", icon: Users, path: "/parceiros" },
    { name: "Clientes", icon: ListPlus, path: "/clientes" },
    { name: "Bonificacoes", icon: Ticket, path: "/bonificacoes" },
    { name: "Relatórios", icon: BarChart, path: "/relatorios" },
    { name: "Usuários", icon: Users, path: "/usuarios" },
    { name: "Planos", icon: CreditCard, path: "/planos" },
    { name: "Minha Assinatura", icon: Receipt, path: "/assinatura" },
    { name: "Configurações", icon: Settings, path: "/configuracoes" },
    { name: "Meus Dados", icon: User, path: "/meus-dados" },
  ];

  const menuItems = allMenuItems.filter((item) => {
    // "Meus Dados" é liberado para todos na URL (cada um edita o próprio
    // cadastro), mas no menu só faz sentido para o parceiro: o administrador
    // usa a tela de Usuários.
    if (item.path === "/meus-dados" && !ehParceiro(userLevel)) {
      return false;
    }

    return podeAcessarRota(userLevel, item.path);
  });

  // Fechar a sidebar no mobile ao mudar de rota
  useEffect(() => {
    setIsOpen(false);
  }, [location, setIsOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 left-0 h-screen w-[272px] text-brand-text z-50 transform transition-transform duration-300 ease-in-out flex flex-col p-3 md:p-4 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <aside className="flex h-full flex-col rounded-[28px] border border-white/5 bg-brand-surface px-3 py-4 shadow-[0_20px_60px_rgba(4,10,24,0.32)]">
          <div className="mb-5 flex items-center justify-between px-2">
            <img src={logoIndiqx} alt="Indiqx" className="h-8" />
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-brand-muted transition-colors hover:bg-white/5 hover:text-brand-text md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-brand-surfaceAlt text-brand-text shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]"
                      : "text-brand-muted hover:bg-white/5 hover:text-brand-text"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-brand-primary text-white"
                          : "bg-white/[0.03] text-brand-muted group-hover:text-brand-text"
                      }`}
                    >
                      <item.icon size={16} />
                    </span>
                    <span className="truncate">{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-4 rounded-[24px] border border-white/5 bg-brand-surfaceAlt px-3 py-3">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/15 text-brand-primary">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-brand-text">
                  {userName || "Usuário"}
                </p>
                <p className="mt-0.5 truncate text-xs capitalize text-brand-muted">
                  {userLevel || "Nível"}
                </p>
              </div>
            </div>
            <Button
              onClick={userLogout}
              variant="ghost-danger"
              className="w-full !py-2 text-xs"
            >
              <LogOut size={14} />
              Sair
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
};

export default Sidebar;
