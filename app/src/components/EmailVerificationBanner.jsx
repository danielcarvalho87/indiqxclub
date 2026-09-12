import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MailWarning, RefreshCw } from "lucide-react";
import { Button } from "./ui/Button";
import { GET_EMAIL_VERIFICATION, POST_REENVIAR_CONFIRMACAO } from "../api";
import { apiFetch, mensagemDeErro } from "../lib/http";

/**
 * Aviso de e-mail pendente de confirmação.
 *
 * Quem não clica no link na hora do cadastro fica sem sinal nenhum depois de
 * entrar no painel. O link vale 24h, então o aviso mostra o prazo restante e
 * permite pedir um novo a qualquer momento — inclusive depois de expirar.
 */

/** "em 7 horas", "em 35 minutos" — ou null quando o prazo já passou. */
function prazoRestante(expiraEm) {
  if (!expiraEm) return null;

  const restanteMs = new Date(expiraEm).getTime() - Date.now();
  if (!Number.isFinite(restanteMs) || restanteMs <= 0) return null;

  const horas = Math.floor(restanteMs / (60 * 60 * 1000));
  if (horas >= 1) {
    return `${horas} hora${horas > 1 ? "s" : ""}`;
  }

  const minutos = Math.max(1, Math.round(restanteMs / (60 * 1000)));
  return `${minutos} minuto${minutos > 1 ? "s" : ""}`;
}

const EmailVerificationBanner = () => {
  const [situacao, setSituacao] = useState(null);
  const [reenviando, setReenviando] = useState(false);

  const carregar = useCallback(async () => {
    const token = window.localStorage.getItem("token");
    if (!token) return;

    try {
      const { url, options } = GET_EMAIL_VERIFICATION(token);
      const response = await apiFetch(url, options);

      if (response.ok) {
        setSituacao(await response.json());
      }
    } catch (error) {
      // Um aviso opcional não deve poluir a tela com erro.
      console.error("Erro ao consultar confirmação de e-mail:", error);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const reenviar = async () => {
    const token = window.localStorage.getItem("token");
    if (!token) return;

    setReenviando(true);
    try {
      const { url, options } = POST_REENVIAR_CONFIRMACAO(token);
      const response = await apiFetch(url, options);

      // mensagemDeErro consome o corpo, então só lemos o JSON no caminho OK.
      if (!response.ok) {
        toast.error(
          await mensagemDeErro(response, "Não foi possível reenviar o link."),
        );
        return;
      }

      const json = await response.json().catch(() => ({}));

      toast.success(json.message || "Link de confirmação reenviado.");
      await carregar();
    } catch (error) {
      console.error("Erro ao reenviar confirmação de e-mail:", error);
      toast.error("Não foi possível reenviar o link.");
    } finally {
      setReenviando(false);
    }
  };

  if (!situacao || situacao.email_verified) return null;

  const restante = prazoRestante(situacao.expires_at);
  const validade = situacao.validade_horas || 24;

  return (
    <div className="mb-5 flex flex-col gap-4 rounded-[24px] border border-amber-500/30 bg-amber-500/10 p-4 md:flex-row md:items-center md:justify-between md:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-300">
          <MailWarning size={18} />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-brand-text">
            Confirme seu e-mail
          </p>
          <p className="mt-1 text-sm text-brand-muted">
            Enviamos um link para{" "}
            <strong className="text-brand-text">{situacao.email}</strong>.{" "}
            {restante
              ? `O link expira em ${restante}.`
              : "O link anterior expirou, peça um novo abaixo."}{" "}
            Cada link vale {validade} horas.
          </p>
        </div>
      </div>

      <Button
        onClick={reenviar}
        disabled={reenviando}
        variant="outline"
        size="sm"
        className="shrink-0 border-amber-400/60 text-amber-200 hover:bg-amber-500 hover:text-brand-dark"
      >
        <RefreshCw size={14} className={reenviando ? "animate-spin" : ""} />
        {reenviando ? "Enviando..." : "Reenviar link"}
      </Button>
    </div>
  );
};

export default EmailVerificationBanner;
