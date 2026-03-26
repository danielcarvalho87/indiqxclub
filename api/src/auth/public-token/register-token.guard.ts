import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { PublicTokenService } from "./public-token.service";

@Injectable()
export class RegisterTokenGuard implements CanActivate {
  constructor(private readonly publicTokenService: PublicTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Token não fornecido");
    }

    const token = authHeader.substring(7);

    try {
      const decoded =
        await this.publicTokenService.validateRegisterToken(token);
      request.registerToken = decoded;
      return true;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw new UnauthorizedException({
          message: "Token expirado. Solicite um novo token.",
          expired: true,
        });
      }

      if (error.name === "JsonWebTokenError") {
        throw new UnauthorizedException("Token inválido");
      }

      throw new ForbiddenException(error.message || "Acesso negado");
    }
  }
}
