import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { AuthRequest } from "./models/AuthRequest";
import { IsPublic } from "./decorators/is-public.decorator";
import { BadRequestException } from "@nestjs/common";
import { Roles } from "./roles/roles.decorator";
import { AccessLevel, isFullAdmin } from "./roles/level.util";

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @IsPublic()
  @Post("login")
  @UseGuards(LocalAuthGuard)
  // Limite estreito contra força bruta de credenciais.
  @Throttle({ default: { limit: 8, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  login(@Request() req: AuthRequest) {
    return this.authService.login(req.user);
  }

  /**
   * Emite um token em nome de outro usuário.
   * FullAdmin acessa qualquer conta; Administrador apenas os parceiros
   * vinculados a ele (master_id).
   */
  @Post("impersonate")
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
  @HttpCode(HttpStatus.OK)
  async impersonate(@Body() body: { userId: number }, @Request() req) {
    if (!body.userId) {
      throw new BadRequestException("ID do usuário alvo é obrigatório.");
    }

    if (!isFullAdmin(req.user.level)) {
      const target = await this.userService.findOne(Number(body.userId));

      if (!target || Number(target.master_id) !== Number(req.user.id)) {
        throw new ForbiddenException(
          "Você só pode acessar contas de parceiros vinculados a você.",
        );
      }
    }

    return this.authService.impersonate(Number(body.userId));
  }

  @IsPublic()
  @Post("public/register-token")
  // Token público: sem limite, um bot poderia gerá-los indefinidamente.
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  generateRegisterToken() {
    return this.authService.generateRegisterToken();
  }

  @Get("auth")
  getUser(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
