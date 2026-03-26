import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useProtectedRoute, useAuth } from "../../hooks/useAuth";
import SessionTimeoutModal from "../Modals/SessionTimeoutModal";
import logoIndiqx from "../../assets/LOGO-INDIQX.svg";

const PrivateLayout = () => {
  const { isLoading, shouldRedirect, redirectTo } = useProtectedRoute("/");
  const { showSessionWarning, renewSession, userLogout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-dark">
        <div className="text-brand-text text-xl">Carregando...</div>
      </div>
    );
  }

  if (shouldRedirect) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="flex min-h-screen bg-brand-dark text-brand-text">
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 px-4 pt-4">
        <div className="flex h-16 items-center justify-between rounded-[24px] border border-white/5 bg-brand-surface px-4 shadow-[0_18px_40px_rgba(4,10,24,0.28)]">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-full p-2 text-brand-text focus:outline-none"
            >
              <Menu size={22} />
            </button>
            <img src={logoIndiqx} alt="Indiqx" className="ml-2 h-6" />
          </div>
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <div className="flex-1 overflow-y-auto md:ml-[272px]">
        <div className="min-h-screen px-4 pb-4 pt-24 md:px-6 md:pb-6 md:pt-6">
          <div className="mx-auto min-h-[calc(100vh-3rem)] max-w-[1400px] rounded-[32px] border border-white/5 bg-brand-surface p-3 shadow-[0_18px_45px_rgba(4,10,24,0.22)] md:p-4">
            <div className="h-full rounded-[24px] border border-white/5 bg-brand-surfaceAlt p-3 md:p-4">
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {showSessionWarning && (
        <SessionTimeoutModal onRenew={renewSession} onLogout={userLogout} />
      )}
    </div>
  );
};

export default PrivateLayout;
