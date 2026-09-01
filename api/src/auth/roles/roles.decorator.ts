// roles.decorator.ts
// Decorator para exigir níveis de acesso em rotas
// Localização: src/auth/roles/roles.decorator.ts

import { SetMetadata } from "@nestjs/common";
import { AccessLevel } from "./level.util";

export const ROLES_KEY = "roles";

/**
 * Exige que o usuário autenticado tenha um dos níveis informados.
 * Ex.: @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
 */
export const Roles = (...roles: AccessLevel[]) => SetMetadata(ROLES_KEY, roles);
