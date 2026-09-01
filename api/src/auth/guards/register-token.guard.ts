// src/auth/guards/register-token.guard.ts
// Valida o token temporário emitido por POST /public/register-token.
// Autônomo (não depende do AuthModule) para poder ser usado pelo
// PublicUserController, que vive no UserModule.

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class RegisterTokenGuard implements CanActivate {
  private readonly jwtService = new JwtService({});

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token não fornecido");
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
        audience: "public-registration",
        issuer: "indiqx-app",
      });

      if (decoded.type !== "register") {
        throw new ForbiddenException("Token inválido para esta operação");
      }

      request.registerToken = decoded;
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedException({
          message: "Token expirado. Solicite um novo token.",
          expired: true,
        });
      }

      throw new UnauthorizedException("Token inválido");
    }
  }
}
