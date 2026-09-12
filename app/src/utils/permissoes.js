// permissoes.js
// Fonte única de quem acessa cada rota privada.
// Antes cada tela decidia sozinha: o menu escondia o item, mas digitar a URL
// direto abria a página (o parceiro chegava em /usuarios e /configuracoes).

import { NIVEIS, normalizarNivel, rotaInicial } from "./level";

const { FULL_ADMIN, ADMIN, PARCEIRO } = NIVEIS;

export const ACESSO_POR_ROTA = {
  "/dashboard": [FULL_ADMIN, ADMIN],
  "/parceiros": [FULL_ADMIN, ADMIN],
  "/bonificacoes": [FULL_ADMIN, ADMIN],
  "/relatorios": [FULL_ADMIN, ADMIN],
  "/usuarios": [FULL_ADMIN, ADMIN],
  "/configuracoes": [FULL_ADMIN, ADMIN],
  // Catálogo de planos e vínculo de assinaturas: só o FullAdmin.
  "/planos": [FULL_ADMIN],
  // Cada administrador vê apenas a assinatura da própria empresa.
  "/assinatura": [ADMIN],
  "/clientes": [FULL_ADMIN, ADMIN, PARCEIRO],
  "/meus-ganhos": [PARCEIRO],
  // Cadastro do próprio usuário: qualquer nível autenticado edita o seu.
  "/meus-dados": [FULL_ADMIN, ADMIN, PARCEIRO],
};

/** Rotas privadas que o nível informado pode abrir. */
export function podeAcessarRota(level, pathname) {
  const nivel = normalizarNivel(level);
  if (!nivel) return false;

  const permitidos = ACESSO_POR_ROTA[pathname];
  // Rota privada sem regra declarada: liberada para quem já está autenticado.
  if (!permitidos) return true;

  return permitidos.includes(nivel);
}

/** Para onde mandar quem tentou abrir uma rota sem permissão. */
export function rotaPermitida(level) {
  return rotaInicial(level);
}
