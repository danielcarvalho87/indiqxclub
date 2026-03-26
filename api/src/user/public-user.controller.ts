// public-user.controller.ts (ATUALIZADO PARA LOCALHOST)
// Controller público para registro de usuários e validação de e-mail
// Localização: src/user/public-user.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { EmailService } from "../email/email.service";
import * as crypto from "crypto";

@Controller("public/user")
export class PublicUserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Registro público de usuário
   * POST /public/user/register
   */
  @Post("register")
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      // Validar se o e-mail já existe
      const existingUser = await this.userService.findByEmail(
        createUserDto.email,
      );

      if (existingUser) {
        throw new HttpException("E-mail já cadastrado", HttpStatus.BAD_REQUEST);
      }

      // Validar campos obrigatórios conforme tipo de pessoa
      if (createUserDto.tipo_pessoa === "juridica") {
        if (!createUserDto.razao_social || !createUserDto.cnpj) {
          throw new HttpException(
            "Razão Social e CNPJ são obrigatórios para Pessoa Jurídica",
            HttpStatus.BAD_REQUEST,
          );
        }

        // Remover formatação do CNPJ antes de validar
        const cnpjLimpo = createUserDto.cnpj.replace(/\D/g, "");

        // Validar se CNPJ já existe
        const existingCnpj = await this.userService.findByCnpj(cnpjLimpo);

        if (existingCnpj) {
          throw new HttpException("CNPJ já cadastrado", HttpStatus.BAD_REQUEST);
        }

        // Salvar CNPJ limpo
        createUserDto.cnpj = cnpjLimpo;
      }

      // Gerar token de validação de e-mail (válido por 24 horas)
      const emailToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiration = new Date();
      tokenExpiration.setHours(tokenExpiration.getHours() + 24);

      // Criar usuário com status Inativo
      const userData: CreateUserDto = {
        ...createUserDto,
        status: "Inativo",
        level: createUserDto.level || "2",
        master_id: createUserDto.master_id || 0,
        plano_id: createUserDto.plano_id || 0,
        email_verified: false,
        email_verification_token: emailToken,
        email_verification_expires: tokenExpiration,
        tipo_pessoa: createUserDto.tipo_pessoa || "fisica",
      };

      // Criar usuário
      const user = await this.userService.create(userData);

      // ✅ CORREÇÃO: URL configurada para localhost:3005 para testes
      // Em produção, usar: process.env.FRONTEND_URL
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3005";
      const confirmationUrl = `${frontendUrl}/confirm-email?token=${emailToken}`;

      console.log("📧 URL de confirmação gerada:", confirmationUrl);

      await this.emailService.sendEmailVerification(
        user.email,
        user.name,
        confirmationUrl,
      );

      return {
        success: true,
        message:
          "Cadastro realizado com sucesso. Verifique seu e-mail para validar sua conta.",
        user_id: user.id,
      };
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Erro ao realizar cadastro",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Confirmação de e-mail
   * POST /public/user/confirm-email
   */
  @Post("confirm-email")
  async confirmEmail(@Body() body: { token: string }) {
    try {
      const { token } = body;

      if (!token) {
        throw new HttpException(
          "Token de validação não fornecido",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Buscar usuário pelo token
      const user = await this.userService.findByEmailToken(token);

      if (!user) {
        throw new HttpException(
          "Token inválido ou expirado",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Verificar se o token já expirou
      if (new Date() > user.email_verification_expires) {
        throw new HttpException("Token expirado", HttpStatus.BAD_REQUEST);
      }

      // Verificar se o e-mail já foi validado
      if (user.email_verified) {
        throw new HttpException(
          "E-mail já foi validado",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Validar e-mail
      await this.userService.verifyEmail(user.id);

      // Enviar e-mail de boas-vindas (opcional, não bloqueia se falhar)
      try {
        await this.emailService.sendWelcomeEmail(user.email, user.name);
      } catch (emailError) {
        console.log("E-mail de boas-vindas não pôde ser enviado:", emailError);
      }

      // Enviar notificação para a equipe administrativa sobre novo cadastro
      try {
        await this.emailService.sendNewUserNotification(
          user.name,
          user.email,
          user.tipo_pessoa || "fisica",
        );
      } catch (notificationError) {
        console.log(
          "Notificação de novo cadastro não pôde ser enviada:",
          notificationError,
        );
      }

      return {
        success: true,
        message: "E-mail validado com sucesso",
        userId: user.id,
      };
    } catch (error) {
      console.error("Erro ao confirmar e-mail:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Erro ao validar e-mail",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Reenviar e-mail de validação
   * POST /public/user/resend-verification
   */
  @Post("resend-verification")
  async resendVerification(@Body() body: { email: string }) {
    try {
      const { email } = body;

      // Buscar usuário pelo e-mail
      const user = await this.userService.findByEmail(email);

      if (!user) {
        throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND);
      }

      // Verificar se o e-mail já foi validado
      if (user.email_verified) {
        throw new HttpException(
          "E-mail já foi validado",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Gerar novo token de validação
      const emailToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiration = new Date();
      tokenExpiration.setHours(tokenExpiration.getHours() + 24);

      // Atualizar token do usuário
      await this.userService.updateEmailVerificationToken(
        user.id,
        emailToken,
        tokenExpiration,
      );

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      const confirmationUrl = `${frontendUrl}/confirm-email?token=${emailToken}`;

      console.log("📧 URL de reenvio gerada:", confirmationUrl);

      await this.emailService.sendEmailVerification(
        user.email,
        user.name,
        confirmationUrl,
      );

      return {
        success: true,
        message: "E-mail de validação reenviado com sucesso",
      };
    } catch (error) {
      console.error("Erro ao reenviar e-mail de validação:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Erro ao reenviar e-mail",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
