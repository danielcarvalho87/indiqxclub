// http.js
// Wrapper de fetch para as chamadas da API.
// Centraliza o tratamento de sessão expirada (401) e falta de permissão (403):
// antes cada tela mostrava apenas "Erro ao buscar X" e uma tabela vazia, sem
// o usuário perceber que precisava entrar de novo.

import { toast } from "react-toastify";

let onUnauthorized = null;

/** AuthContext registra aqui o que fazer quando a sessão cai. */
export function registerUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

// Evita uma enxurrada de toasts quando várias requisições falham juntas
// (o dashboard dispara três chamadas em paralelo).
let ultimoAviso = 0;
const JANELA_AVISO_MS = 4000;

function avisarUmaVez(tipo, mensagem) {
  const agora = Date.now();
  if (agora - ultimoAviso < JANELA_AVISO_MS) return;
  ultimoAviso = agora;
  toast[tipo](mensagem);
}

/**
 * Mesma assinatura de fetch. Use apenas para chamadas da própria API —
 * serviços externos (ViaCEP) devem continuar usando fetch direto.
 */
export async function apiFetch(url, options = {}) {
  let response;

  try {
    response = await fetch(url, options);
  } catch (error) {
    avisarUmaVez("error", "Sem conexão com o servidor.");
    throw error;
  }

  if (response.status === 401) {
    avisarUmaVez("warning", "Sua sessão expirou. Entre novamente.");
    if (onUnauthorized) onUnauthorized();
  } else if (response.status === 403) {
    avisarUmaVez("error", "Você não tem permissão para esta ação.");
  } else if (response.status === 429) {
    avisarUmaVez("warning", "Muitas tentativas. Aguarde um momento.");
  }

  return response;
}

/** Extrai a mensagem de erro da API, que pode vir como string ou array. */
export async function mensagemDeErro(response, padrao = "Ocorreu um erro.") {
  try {
    const corpo = await response.json();
    if (Array.isArray(corpo.message)) return corpo.message.join(", ");
    return corpo.message || padrao;
  } catch {
    return padrao;
  }
}
