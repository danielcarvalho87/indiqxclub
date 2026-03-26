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
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import logoIndiqx from "../../assets/LOGO-INDIQX.svg";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { userLogout, userLevel, data } = useAuth();
  const location = useLocation();
  const userName = [data?.name, data?.sobrenome].filter(Boolean).join(" ");

  const allMenuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
      roles: ["admin", "master", "manager"],
    },
    {
      name: "Meus Ganhos",
      icon: TrendingUp,
      path: "/meus-ganhos",
      roles: ["parceiro"],
    },
    {
      name: "Parceiros",
      icon: Users,
      path: "/parceiros",
      roles: ["admin", "master", "manager"],
    },
    {
      name: "Clientes",
      icon: ListPlus,
      path: "/clientes",
      roles: ["admin", "master", "manager", "parceiro"],
    },
    {
      name: "Bonificacoes",
      icon: Ticket,
      path: "/bonificacoes",
      roles: ["admin", "master", "manager"],
    },
    {
      name: "Relatórios",
      icon: BarChart,
      path: "/relatorios",
      roles: ["admin", "master", "manager", "fulladmin"],
    },
    {
      name: "Usuários",
      icon: Users,
      path: "/usuarios",
      roles: ["admin", "master", "manager", "fulladmin"],
    },
    {
      name: "Configurações",
      icon: Settings,
      path: "/configuracoes",
      roles: ["admin", "master", "manager", "fulladmin"],
    },
    {
      name: "Meus Dados",
      icon: User,
      path: "/meus-dados",
      roles: ["parceiro"],
    },
  ];

  const menuItems = allMenuItems.filter((item) => {
    if (!userLevel) return false;
    let level = userLevel.toLowerCase().replace(/\s+/g, "");
    // Normalizar nível 'administrador' para 'admin' para corresponder aos roles
    if (level === "administrador") level = "admin";
    if (level === "fulladmin") {
      // Ocultar menus exclusivos de parceiro e Configurações para o FullAdmin
      if (
        item.path === "/meus-ganhos" ||
        item.path === "/meus-dados" ||
        item.path === "/configuracoes"
      ) {
        return false;
      }
      return true;
    }
    return item.roles.includes(level);
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
