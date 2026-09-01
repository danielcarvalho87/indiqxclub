import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, XCircle, Mail, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { API_URL } from "../api";
import logoIndiqx from "../assets/indiqx-logo-w.png";

/**
 * Confirmação de e-mail.
 * A API envia o link {FRONTEND_URL}/confirm-email?token=... no cadastro;
 * sem esta rota o link caía no redirecionamento padrão e o parceiro nunca
 * conseguia validar a conta.
 */
const ConfirmEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get("token");

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  // StrictMode monta o componente duas vezes em dev; sem isso a segunda
  // chamada recebe "E-mail já foi validado" e a tela mostra erro.
  const confirmed = useRef(false);

  useEffect(() => {
    if (confirmed.current) return;
    confirmed.current = true;

    if (!token) {
      setStatus("error");
      setMessage("Link inválido: token de confirmação não encontrado.");
      return;
    }

    const confirm = async () => {
      try {
        const response = await fetch(`${API_URL}/public/user/confirm-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "E-mail validado com sucesso.");
        } else {
          setStatus("error");
          setMessage(data.message || "Não foi possível validar o e-mail.");
        }
      } catch (error) {
        console.error("Erro ao confirmar e-mail:", error);
        setStatus("error");
        setMessage("Erro de conexão com o servidor.");
      }
    };

    confirm();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    try {
      const response = await fetch(
        `${API_URL}/public/user/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resendEmail }),
        },
      );
      const data = await response.json();
      setMessage(
        data.message ||
          "Se o e-mail estiver cadastrado e pendente, o link será reenviado.",
      );
    } catch (error) {
      console.error("Erro ao reenviar validação:", error);
      setMessage("Erro de conexão com o servidor.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark px-4 text-brand-text">
      <div className="max-w-md w-full space-y-6 bg-brand-surface p-8 rounded-xl shadow-2xl border border-brand-border">
        <div className="text-center flex flex-col items-center">
          <img src={logoIndiqx} alt="Indiqx" className="h-12 mb-4" />
          <h2 className="mt-4 text-2xl font-semibold text-brand-text">
            Confirmação de E-mail
          </h2>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center space-y-4 py-6">
            <Mail size={56} className="text-brand-primary animate-pulse" />
            <p className="text-center text-brand-muted">
              Validando seu e-mail...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-4 py-6">
            <CheckCircle size={56} className="text-green-500" />
            <p className="text-center text-brand-text">{message}</p>
            <p className="text-center text-sm text-brand-muted">
              Sua conta será liberada assim que o administrador aprovar o
              cadastro.
            </p>
            <Button onClick={() => navigate("/login")} className="w-full py-3">
              IR PARA O LOGIN
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-4 py-6">
            <XCircle size={56} className="text-red-500" />
            <p className="text-center text-brand-text">{message}</p>

            <form onSubmit={handleResend} className="w-full space-y-3 pt-2">
              <p className="text-sm text-brand-muted text-center">
                Informe seu e-mail para receber um novo link de validação:
              </p>
              <Input
                type="email"
                placeholder="Seu e-mail cadastrado"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                disabled={resending}
                className="w-full py-3"
              >
                {resending ? "ENVIANDO..." : "REENVIAR LINK"}
              </Button>
            </form>
          </div>
        )}

        <div className="pt-4 border-t border-brand-border flex justify-center">
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

export default ConfirmEmail;
