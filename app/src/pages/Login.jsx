import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useLoginForm } from "../hooks/useAuth";
import logoIndiqx from "../assets/LOGO-INDIQX.svg";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { handleLogin: loginSubmit, isLoading, error } = useLoginForm();

  const handleLogin = async (e) => {
    e.preventDefault();
    await loginSubmit(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4 relative text-brand-text">
      <div className="max-w-md w-full space-y-8 bg-brand-surface p-8 rounded-xl shadow-2xl border border-brand-border">
        <div className="text-center flex flex-col items-center">
          <img src={logoIndiqx} alt="Indiqx" className="h-12 mb-4" />
          <p className="mt-2 text-sm text-brand-muted">
            Clube exclusivo para parceiros
          </p>
          <h2 className="mt-6 text-2xl font-semibold text-brand-text">
            Acesse sua conta
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 text-red-500 rounded-md text-sm text-center">
                {error}
              </div>
            )}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted">
                <User size={20} />
              </div>
              <Input
                type="email"
                placeholder="Email"
                className="pl-10 bg-brand-dark border-brand-border text-brand-text focus:border-brand-primary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted">
                <Lock size={20} />
              </div>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                className="pl-10 pr-10 bg-brand-dark border-brand-border text-brand-text focus:border-brand-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-primary"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-3"
              disabled={isLoading}
            >
              {isLoading ? "ENTRANDO..." : "ENTRAR"}
            </Button>
          </div>

          <div className="pt-4 border-t border-brand-border items-center text-center flex justify-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/")}
              className="text-brand-primary flex hover:text-brand-hover font-medium text-sm transition-colors p-0 h-auto"
            >
              <ArrowLeft size={16} className="mr-2" />
              Voltar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
