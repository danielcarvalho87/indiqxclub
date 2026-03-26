import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { AuthRequest } from "./models/AuthRequest";
import { IsPublic } from "./decorators/is-public.decorator";
import { RegisterTokenGuard } from "./guards/register-token.guard";
import { CreateUserPublicDto } from "./dto/create-user-public.dto";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post("login")
  @UseGuards(LocalAuthGuard)
  @HttpCode(HttpStatus.OK)
  login(@Request() req: AuthRequest) {
    return this.authService.login(req.user);
  }

  @Post("impersonate")
  @HttpCode(HttpStatus.OK)
  async impersonate(@Body() body: { userId: number }, @Request() req) {
    const adminLevel = Number(req.user.level);

    if (adminLevel > 2) {
      throw new UnauthorizedException(
        "Acesso negado: Apenas administradores podem acessar contas de usuários."
      );
    }

    if (!body.userId) {
      throw new BadRequestException("ID do usuário alvo é obrigatório.");
    }

    return this.authService.impersonate(body.userId);
  }

  @IsPublic()
  @Post("public/register-token")
  @HttpCode(HttpStatus.OK)
  generateRegisterToken() {
    return this.authService.generateRegisterToken();
  }

  @IsPublic()
  @Post("public/user/register")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(RegisterTokenGuard)
  async registerPublicUser(@Body() createUserDto: CreateUserPublicDto) {
    if (
      !createUserDto.name ||
      !createUserDto.email ||
      !createUserDto.password ||
      !createUserDto.plano_id
    ) {
      throw new BadRequestException("Campos obrigatórios não preenchidos");
    }

    return this.authService.registerPublicUser(createUserDto);
  }

  @Get("auth")
  getUser(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }
}
