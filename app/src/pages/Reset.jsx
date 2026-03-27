import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Lock, Mail, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { API_URL } from "../api";
import logoIndiqx from "../assets/indiqx-logo-w.png";

const Reset = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tokenFromUrl = queryParams.get("token");

  const [step, setStep] = useState(tokenFromUrl ? 2 : 1); // 1: Solicitar Token, 2: Redefinir Senha, 3: Sucesso
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      setStep(2);
    }
  }, [tokenFromUrl]);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor, informe seu e-mail.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/public/user/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "E-mail de redefinição enviado!");
        // We keep the user on step 1 and wait for them to click the link in the email
        // Or we could show a success message
        setStep(3);
      } else {
        toast.error(data.message || "Erro ao solicitar redefinição.");
      }
    } catch (error) {
      console.error("Erro ao solicitar token:", error);
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/public/user/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: tokenFromUrl,
          password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Senha alterada com sucesso!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(data.message || "Erro ao redefinir senha.");
      }
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      toast.error("Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4 relative text-brand-text">
      <div className="max-w-md w-full space-y-8 bg-brand-surface p-8 rounded-xl shadow-2xl border border-brand-border">
        <div className="text-center flex flex-col items-center">
          <img src={logoIndiqx} alt="Indiqx" className="h-12 mb-4" />
          <h2 className="mt-6 text-2xl font-semibold text-brand-text">
            Redefinir Senha
          </h2>
          <p className="mt-2 text-sm text-brand-muted">
            {step === 1 && "Informe seu e-mail para receber as instruções"}
            {step === 2 && "Crie uma nova senha para sua conta"}
            {step === 3 && "Verifique sua caixa de entrada"}
          </p>
        </div>

        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleRequestToken}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted">
                  <Mail size={20} />
                </div>
                <Input
                  type="email"
                  placeholder="Seu e-mail cadastrado"
                  className="pl-10 bg-brand-dark border-brand-border text-brand-text focus:border-brand-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-3"
                disabled={loading}
              >
                {loading ? "ENVIANDO..." : "ENVIAR LINK DE RECUPERAÇÃO"}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted">
                  <Lock size={20} />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nova Senha"
                  className="pl-10 pr-10 bg-brand-dark border-brand-border text-brand-text focus:border-brand-primary"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted">
                  <Lock size={20} />
                </div>
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar Nova Senha"
                  className="pl-10 pr-10 bg-brand-dark border-brand-border text-brand-text focus:border-brand-primary"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-brand-muted hover:text-brand-primary"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-3"
                disabled={loading}
              >
                {loading ? "SALVANDO..." : "REDEFINIR SENHA"}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="mt-8 flex flex-col items-center justify-center space-y-4">
            <CheckCircle size={64} className="text-brand-primary mb-4" />
            <p className="text-center text-brand-text">
              Enviamos um link de redefinição para o seu e-mail. Por favor,
              verifique sua caixa de entrada e spam.
            </p>
          </div>
        )}

        <div className="pt-4 border-t border-brand-border items-center text-center flex justify-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate("/login")}
            className="text-brand-primary flex hover:text-brand-hover font-medium text-sm transition-colors p-0 h-auto"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar para o Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Reset;
