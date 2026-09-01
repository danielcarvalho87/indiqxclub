// public-user.controller.ts
// Controller público para registro de usuários, validação de e-mail e reset de senha
// Localização: src/user/public-user.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { UserService } from "./user.service";
import { CreatePublicUserDto } from "./dto/create-public-user.dto";
import { EmailService } from "../email/email.service";
import { ConfiguracoesService } from "../configuracoes/configuracoes.service";
import * as crypto from "crypto";
import { IsPublic } from "../auth/decorators/is-public.decorator";
import { RegisterTokenGuard } from "../auth/guards/register-token.guard";

const MIN_PASSWORD_LENGTH = 8;

/** Hash do token guardado no banco; o valor em claro só vai no e-mail. */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

@IsPublic()
@Controller("public/user")
export class PublicUserController {
  constructor(
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly configuracoesService: ConfiguracoesService,
  ) {}

  /**
   * Registro público de usuário (parceiro)
   * POST /public/user/register
   *
   * Nível, status e flags de verificação são definidos pelo servidor.
   * O corpo da requisição nunca decide o nível de acesso.
   */
  @Post("register")
  @UseGuards(RegisterTokenGuard)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(@Body() createUserDto: CreatePublicUserDto) {
    try {
      const email = createUserDto.email.trim().toLowerCase();

      // Validar se o e-mail já existe
      const existingUser = await this.userService.findByEmail(email);

      if (existingUser) {
        throw new HttpException("E-mail já cadastrado", HttpStatus.BAD_REQUEST);
      }

      let cnpjLimpo: string | undefined;

      // Validar campos obrigatórios conforme tipo de pessoa
      if (createUserDto.tipo_pessoa === "juridica") {
        if (!createUserDto.razao_social || !createUserDto.cnpj) {
          throw new HttpException(
            "Razão Social e CNPJ são obrigatórios para Pessoa Jurídica",
            HttpStatus.BAD_REQUEST,
          );
        }

        // Remover formatação do CNPJ antes de validar
        cnpjLimpo = createUserDto.cnpj.replace(/\D/g, "");

        // Validar se CNPJ já existe
        const existingCnpj = await this.userService.findByCnpj(cnpjLimpo);

        if (existingCnpj) {
          throw new HttpException("CNPJ já cadastrado", HttpStatus.BAD_REQUEST);
        }
      }

      // Gerar token de validação de e-mail (válido por 24 horas)
      const emailToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiration = new Date();
      tokenExpiration.setHours(tokenExpiration.getHours() + 24);

      // Cria o usuário sempre como Parceiro inativo, aguardando a
      // confirmação de e-mail e a aprovação do administrador.
      const user = await this.userService.createPublicUser({
        ...createUserDto,
        email,
        cnpj: cnpjLimpo ?? createUserDto.cnpj,
        emailVerificationToken: emailToken,
        emailVerificationExpires: tokenExpiration,
      });

      const frontendUrl = process.env.FRONTEND_URL || "https://indiqx.club";
      const confirmationUrl = `${frontendUrl}/confirm-email?token=${emailToken}`;

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
      if (error instanceof HttpException) {
        throw error;
      }

      console.error("Erro ao registrar usuário:", error);

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
  @Throttle({ default: { limit: 10, ttl: 60000 } })
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
      if (
        !user.email_verification_expires ||
        new Date() > user.email_verification_expires
      ) {
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
      if (error instanceof HttpException) {
        throw error;
      }

      console.error("Erro ao confirmar e-mail:", error);

      throw new HttpException(
        "Erro ao validar e-mail",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Reenviar e-mail de validação
   * POST /public/user/resend-verification
   *
   * Responde sempre da mesma forma para não revelar quais e-mails existem.
   */
  @Post("resend-verification")
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async resendVerification(@Body() body: { email: string }) {
    const genericResponse = {
      success: true,
      message:
        "Se o e-mail estiver cadastrado e pendente de validação, o link será reenviado.",
    };

    try {
      const user = await this.userService.findByEmail(body?.email || "");

      if (!user || user.email_verified) {
        return genericResponse;
      }

      // Gerar novo token de validação
      const emailToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiration = new Date();
      tokenExpiration.setHours(tokenExpiration.getHours() + 24);

      await this.userService.updateEmailVerificationToken(
        user.id,
        emailToken,
        tokenExpiration,
      );

      const frontendUrl = process.env.FRONTEND_URL || "https://indiqx.club";
      const confirmationUrl = `${frontendUrl}/confirm-email?token=${emailToken}`;

      await this.emailService.sendEmailVerification(
        user.email,
        user.name,
        confirmationUrl,
      );

      return genericResponse;
    } catch (error) {
      console.error("Erro ao reenviar e-mail de validação:", error);
      return genericResponse;
    }
  }

  /**
   * Solicitar redefinição de senha
   * POST /public/user/forgot-password
   */
  @Post("forgot-password")
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async forgotPassword(@Body() body: { email: string }) {
    // Resposta única: não revela quais e-mails estão cadastrados.
    const genericResponse = {
      success: true,
      message: "Se o e-mail existir, um link de redefinição será enviado.",
    };

    try {
      const user = await this.userService.findByEmail(body?.email || "");

      if (!user) {
        return genericResponse;
      }

      // Token em claro vai no e-mail; o banco guarda apenas o hash.
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenExpiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await this.userService.setResetToken(
        user.id,
        hashToken(resetToken),
        tokenExpiration,
      );

      const frontendUrl = process.env.FRONTEND_URL || "https://indiqx.club";
      const resetUrl = `${frontendUrl}/reset?token=${resetToken}`;

      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetUrl,
      );

      return genericResponse;
    } catch (error) {
      console.error("Erro ao solicitar redefinição de senha:", error);
      return genericResponse;
    }
  }

  /**
   * Redefinir senha com token
   * POST /public/user/reset-password
   */
  @Post("reset-password")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async resetPassword(@Body() body: { token: string; password: string }) {
    try {
      const { token, password } = body;

      if (!token || !password) {
        throw new HttpException(
          "Token e nova senha são obrigatórios",
          HttpStatus.BAD_REQUEST,
        );
      }

      if (password.length < MIN_PASSWORD_LENGTH) {
        throw new HttpException(
          `A senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userService.findByResetTokenHash(
        hashToken(token),
      );

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

      await this.userService.resetPassword(user.id, password);

      // Enviar e-mail de confirmação (não bloqueia o fluxo se falhar)
      try {
        await this.emailService.sendPasswordChangedConfirmation(
          user.email,
          user.name,
        );
      } catch (emailError) {
        console.log("E-mail de confirmação não pôde ser enviado:", emailError);
      }

      return {
        success: true,
        message: "Senha alterada com sucesso",
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error("Erro ao redefinir senha:", error);

      throw new HttpException(
        "Erro ao redefinir senha",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
