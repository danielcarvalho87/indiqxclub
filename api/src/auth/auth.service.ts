// src/auth/auth.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import { UserPayload } from "./models/UserPayload";
import { UserToken } from "./models/UserToken";
import { UnauthorizedError } from "./errors/unauthorized.error";
import { EmailService } from "../email/email.service";
import { ConfiguracoesService } from "../configuracoes/configuracoes.service";

/**
 * Hash descartável usado para igualar o tempo de resposta quando o e-mail
 * não existe, evitando enumeração de usuários por diferença de latência.
 */
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.pM/xUdA9c4xVxCz0hLDGRUZ0kQ.C";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly configuracoesService: ConfiguracoesService
  ) { }

  login(user: User): UserToken {
    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      level: user.level,
      master_id: user.master_id,
      status: user.status,
    };

    const jwtToken = this.jwtService.sign(payload);

    return {
      access_token: jwtToken,
    };
  }

  async impersonate(userId: number): Promise<UserToken> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new NotFoundException("Usuário não encontrado.");
    }

    const payload: UserPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      level: user.level,
      master_id: user.master_id,
      status: user.status,
    };

    const jwtToken = this.jwtService.sign(payload);

    return {
      access_token: jwtToken,
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const normalizedEmail = (email || "").trim().toLowerCase();
    const user = await this.userService.findByEmail(normalizedEmail);

    // Compara sempre, mesmo sem usuário, para manter o tempo de resposta
    // constante entre e-mail existente e inexistente.
    const isPasswordValid = await bcrypt.compare(
      password,
      user?.password || DUMMY_HASH
    );

    if (!user || !isPasswordValid) {
      throw new UnauthorizedError(
        "Email address or password provided is incorrect."
      );
    }

    // A checagem de status existia apenas no frontend, o que permitia
    // autenticar contas inativas chamando POST /login diretamente.
    if ((user.status || "").trim().toLowerCase() !== "ativo") {
      throw new UnauthorizedError(
        "Usuário inativo. Entre em contato com o suporte."
      );
    }

    return {
      ...user,
      password: undefined,
    };
  }

  // ============================================
  // Token Público de Registro
  // ============================================

  /**
   * Gera um token público temporário para o processo de registro
   * Validade: 30 minutos
   */
  generateRegisterToken() {
    const payload = {
      type: "register",
      purpose: "public_registration",
      timestamp: Date.now(),
    };

    const token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: "30m",
      issuer: "indiqx-app",
      audience: "public-registration",
    });

    // Calcular timestamp de expiração (30 minutos)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    return {
      success: true,
      access_token: token,
      token_type: "Bearer",
      expires_in: 1800, // 30 minutos em segundos
      expires_at: expiresAt.toISOString(),
      message: "Token gerado com sucesso",
    };
  }

  async getProfile(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) return null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  /**
   * Valida o token de registro
   */
  async validateRegisterToken(token: string): Promise<any> {
    const decoded = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET,
      audience: "public-registration",
      issuer: "indiqx-app",
    });

    // Verificar se é um token de registro
    if (decoded.type !== "register") {
      throw new Error("Token inválido para esta operação");
    }

    return decoded;
  }

}
