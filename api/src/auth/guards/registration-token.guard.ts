// src/auth/guards/registration-token.guard.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class RegistrationTokenGuard extends AuthGuard("jwt") {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException("Token não fornecido");
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });

      // Verifica se é um token de registro
      if (payload.type !== "registration") {
        throw new UnauthorizedException("Token inválido para esta operação");
      }

      // Verifica se o token tem os escopos necessários
      if (!payload.scope || !payload.scope.includes("list_plans")) {
        throw new UnauthorizedException(
          "Token sem permissão para esta operação"
        );
      }

      request["user"] = payload;
    } catch {
      throw new UnauthorizedException("Token inválido ou expirado");
    }

    return true;
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
