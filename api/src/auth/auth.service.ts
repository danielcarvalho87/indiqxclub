// src/auth/auth.service.ts
import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { User } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";
import { UserPayload } from "./models/UserPayload";
import { UserToken } from "./models/UserToken";
import { UnauthorizedError } from "./errors/unauthorized.error";
import { CreateUserPublicDto } from "./dto/create-user-public.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) { }

  // ============================================
  // MÉTODOS EXISTENTES (sem alteração)
  // ============================================

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
    const user = await this.userService.findByEmail(email);

    if (user) {
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        return {
          ...user,
          password: undefined,
        };
      }
    }
    throw new UnauthorizedError(
      "Email address or password provided is incorrect."
    );
  }

  // ============================================
  // NOVOS MÉTODOS - Token Público de Registro
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
      secret: process.env.JWT_SECRET || "sua-chave-secreta-super-segura",
      expiresIn: "30m",
      issuer: "saudeflow-app",
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
    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || "sua-chave-secreta-super-segura",
        audience: "public-registration",
        issuer: "saudeflow-app",
      });

      // Verificar se é um token de registro
      if (decoded.type !== "register") {
        throw new Error("Token inválido para esta operação");
      }

      return decoded;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Registra um novo usuário através do processo público
   */
  async registerPublicUser(createUserDto: CreateUserPublicDto) {
    // Verificar se email já existe
    const existingUser = await this.userService.findByEmail(
      createUserDto.email
    );
    if (existingUser) {
      throw new ConflictException("E-mail já cadastrado");
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Preparar dados do usuário
    const userData = {
      name: createUserDto.name,
      sobrenome: createUserDto.sobrenome,
      email: createUserDto.email,
      password: hashedPassword,
      cpf: createUserDto.cpf,
      telefone: createUserDto.telefone,
      plano_id: createUserDto.plano_id,
      level: createUserDto.level || "2",
      status: createUserDto.status || "Inativo",
      master_id: createUserDto.master_id || 0,
      nascimento: createUserDto.nascimento,
      sexo: createUserDto.sexo,
      ecivil: createUserDto.ecivil,
      especialidade: createUserDto.especialidade,
      nconselho: createUserDto.nconselho,
    };

    // Criar usuário usando método específico para registro público
    const user = await this.userService.createPublicUser(userData);

    // Remover senha da resposta
    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      message: "Usuário registrado com sucesso",
      user_id: userWithoutPassword.id,
      id: userWithoutPassword.id,
      user: userWithoutPassword,
    };
  }
}
