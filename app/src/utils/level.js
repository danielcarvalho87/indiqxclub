// level.js
// Normalização de níveis de acesso no front-end.
// Espelha src/auth/roles/level.util.ts da API: o banco guarda variações
// ("FullAdmin", "Full Admin", "Administrador", "Admin", "Parceiro") e qualquer
// comparação direta de string quebra assim que o valor vem com outra grafia.

export const NIVEIS = {
  FULL_ADMIN: "fulladmin",
  ADMIN: "admin",
  PARCEIRO: "parceiro",
};

/**
 * Converte qualquer variação vinda da API para um nível canônico.
 * Retorna null quando o nível não é reconhecido (tratado como sem permissão).
 */
export function normalizarNivel(level) {
  if (!level) return null;

  const compacto = String(level)
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  switch (compacto) {
    case "fulladmin":
    case "1":
      return NIVEIS.FULL_ADMIN;
    case "admin":
    case "administrador":
    case "master":
    case "manager":
    case "2":
      return NIVEIS.ADMIN;
    case "parceiro":
    case "corretor":
    case "3":
      return NIVEIS.PARCEIRO;
    default:
      return null;
  }
}

export function ehFullAdmin(level) {
  return normalizarNivel(level) === NIVEIS.FULL_ADMIN;
}

export function ehAdmin(level) {
  return normalizarNivel(level) === NIVEIS.ADMIN;
}

/** Administrador ou FullAdmin. */
export function ehQualquerAdmin(level) {
  const nivel = normalizarNivel(level);
  return nivel === NIVEIS.ADMIN || nivel === NIVEIS.FULL_ADMIN;
}

export function ehParceiro(level) {
  return normalizarNivel(level) === NIVEIS.PARCEIRO;
}

/** Rota inicial de cada nível após o login. */
export function rotaInicial(level) {
  return ehParceiro(level) ? "/meus-ganhos" : "/dashboard";
}
