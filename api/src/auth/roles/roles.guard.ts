// roles.guard.ts
// Guard que aplica os níveis exigidos por @Roles()
// Localização: src/auth/roles/roles.guard.ts

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator";
import { AccessLevel, normalizeLevel } from "./level.util";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AccessLevel[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const level = normalizeLevel(request.user?.level);

    if (!level || !requiredRoles.includes(level)) {
      throw new ForbiddenException(
        "Você não tem permissão para executar esta ação.",
      );
    }

    return true;
  }
}
