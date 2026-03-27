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
import { ConfiguracoesService } from "../configuracoes/configuracoes.service";
import * as crypto from "crypto";
import { IsPublic } from "../auth/decorators/is-public.decorator";

@IsPublic()
@Controller("public/user")
export class PublicUserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly configuracoesService: ConfiguracoesService,
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

      // ✅ URL do Frontend: Usa a variável de ambiente, ou 'https://indiqx.club' em produção
      const frontendUrl = process.env.FRONTEND_URL || "https://indiqx.club";
      const confirmationUrl = `${frontendUrl}/confirm-email?token=${emailToken}`;

      console.log("📧 URL de confirmação gerada:", confirmationUrl);

      await this.emailService.sendEmailVerification(
        user.email,
        user.name,
        confirmationUrl,
      );

      // Enviar e-mail informando o parceiro que ele foi cadastrado na empresa X
      if (user.master_id) {
        try {
          const configuracoes = await this.configuracoesService.findByMasterId(
            user.master_id,
          );
          if (configuracoes && configuracoes.length > 0) {
            const empresaNome = configuracoes[0].nomeEmpresa;
            await this.emailService.sendPartnerRegistrationEmail(
              user.email,
              user.name,
              empresaNome,
            );
          }
        } catch (error) {
          console.log(
            "Erro ao buscar configurações ou enviar e-mail de registro de parceiro:",
            error,
          );
        }
      }

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

      const frontendUrl = process.env.FRONTEND_URL || "https://indiqx.club";
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

  /**
   * Solicitar redefinição de senha
   * POST /public/user/forgot-password
   */
  @Post("forgot-password")
  async forgotPassword(@Body() body: { email: string }) {
    try {
      const { email } = body;
      const user = await this.userService.findByEmail(email);

      if (!user) {
        // Não retornar erro para não expor quais e-mails estão cadastrados
        return {
          success: true,
          message: "Se o e-mail existir, um link de redefinição será enviado.",
        };
      }

      // Gerar token de reset
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiration = new Date();
      tokenExpiration.setHours(tokenExpiration.getHours() + 1); // 1 hora de validade

      // Atualizar usuário com o token
      await this.userService.update(user.id, {
        resetPasswordToken: resetToken,
        resetPasswordExpires: tokenExpiration,
      } as any);

      const frontendUrl = process.env.FRONTEND_URL || "https://indiqx.club";
      const resetUrl = `${frontendUrl}/reset?token=${resetToken}`;

      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetUrl,
      );

      return {
        success: true,
        message: "Se o e-mail existir, um link de redefinição será enviado.",
      };
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      throw new HttpException(
        "Erro ao solicitar redefinição de senha",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Redefinir senha com token
   * POST /public/user/reset-password
   */
  @Post("reset-password")
  async resetPassword(@Body() body: { token: string; password: string }) {
    try {
      const { token, password } = body;

      if (!token || !password) {
        throw new HttpException(
          "Token e nova senha são obrigatórios",
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userService.findByResetToken(token);

      if (
        !user ||
        !user.resetPasswordExpires ||
        new Date() > user.resetPasswordExpires
      ) {
        throw new HttpException(
          "Token inválido ou expirado",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Atualizar a senha (o hash é feito no userService.update)
      await this.userService.update(user.id, {
        password: password,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      } as any);

      // Enviar e-mail de confirmação
      await this.emailService.sendPasswordChangedConfirmation(
        user.email,
        user.name,
      );

      return {
        success: true,
        message: "Senha alterada com sucesso",
      };
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        "Erro ao redefinir senha",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
