// level.util.ts
// Normalização e hierarquia de níveis de acesso
// Localização: src/auth/roles/level.util.ts

/**
 * Níveis canônicos do sistema.
 * O banco guarda variações ("FullAdmin", "Full Admin", "Administrador",
 * "Admin", "Parceiro"), por isso tudo passa por normalizeLevel antes de
 * qualquer comparação.
 */
export enum AccessLevel {
  FullAdmin = "fulladmin",
  Admin = "admin",
  Parceiro = "parceiro",
}

/** Quanto maior o peso, mais permissões. */
const LEVEL_WEIGHT: Record<AccessLevel, number> = {
  [AccessLevel.FullAdmin]: 3,
  [AccessLevel.Admin]: 2,
  [AccessLevel.Parceiro]: 1,
};

/**
 * Converte qualquer variação armazenada no banco para um nível canônico.
 * Retorna null quando o nível não é reconhecido (tratado como sem permissão).
 */
export function normalizeLevel(level?: string | null): AccessLevel | null {
  if (!level) return null;

  const compact = String(level).toLowerCase().replace(/[\s_-]/g, "");

  switch (compact) {
    case "fulladmin":
    case "1":
      return AccessLevel.FullAdmin;
    case "admin":
    case "administrador":
    case "2":
      return AccessLevel.Admin;
    case "parceiro":
    case "corretor":
    case "3":
      return AccessLevel.Parceiro;
    default:
      return null;
  }
}

export function isFullAdmin(level?: string | null): boolean {
  return normalizeLevel(level) === AccessLevel.FullAdmin;
}

export function isAdmin(level?: string | null): boolean {
  return normalizeLevel(level) === AccessLevel.Admin;
}

/** Admin ou FullAdmin. */
export function isAnyAdmin(level?: string | null): boolean {
  const normalized = normalizeLevel(level);
  return (
    normalized === AccessLevel.Admin || normalized === AccessLevel.FullAdmin
  );
}

export function isParceiro(level?: string | null): boolean {
  return normalizeLevel(level) === AccessLevel.Parceiro;
}

/** Verifica se `level` tem peso maior ou igual ao de `required`. */
export function hasAtLeast(
  level: string | null | undefined,
  required: AccessLevel,
): boolean {
  const normalized = normalizeLevel(level);
  if (!normalized) return false;
  return LEVEL_WEIGHT[normalized] >= LEVEL_WEIGHT[required];
}
