// email.controller.ts (ATUALIZADO)
// Controller de e-mail com endpoints públicos para reset de senha
// Localização: src/email/email.controller.ts

import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Inject,
} from "@nestjs/common";
import { EmailService } from "./email.service";
import { Repository } from "typeorm";
import { User } from "../user/entities/user.entity";
import { IsPublic } from "../auth/decorators/is-public.decorator"; // Importar decorator Public
import * as crypto from "crypto";

@Controller("email")
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    @Inject("USER_REPOSITORY")
    private userRepository: Repository<User>,
  ) {}

  // ============================================
  // ENDPOINTS PÚBLICOS - Reset de Senha
  // ============================================

  /**
   * Solicita reset de senha - envia e-mail com link de recuperação
   * POST /email/password-reset
   * @IsPublic - Não requer autenticação
   */
  @IsPublic()
  @Post("password-reset")
  async requestPasswordReset(@Body() body: { email: string }) {
    try {
      const { email } = body;

      if (!email) {
        throw new HttpException("E-mail não fornecido", HttpStatus.BAD_REQUEST);
      }

      // Normalizar e-mail
      const normalizedEmail = email.trim().toLowerCase();

      // Buscar usuário pelo e-mail
      const user = await this.userRepository.findOne({
        where: { email: normalizedEmail },
      });

      // Por segurança, sempre retornamos sucesso mesmo se o usuário não existir
      // Isso evita que atacantes descubram quais e-mails estão cadastrados
      if (!user) {
        console.log(
          `⚠️ Tentativa de reset para e-mail não cadastrado: ${normalizedEmail}`,
        );
        return {
          success: true,
          message:
            "Se o e-mail estiver cadastrado, você receberá um link de recuperação.",
        };
      }

      // Gerar token de reset (válido por 1 hora)
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetTokenHash = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Salvar hash do token e expiração no usuário
      user.resetPasswordToken = resetTokenHash;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await this.userRepository.save(user);

      // Montar URL de reset
      const frontendUrl = process.env.FRONTEND_URL || "https://indiqx.club";
      const resetUrl = `${frontendUrl}/reset?token=${resetToken}&email=${encodeURIComponent(normalizedEmail)}`;

      // Enviar e-mail de reset
      await this.emailService.sendPasswordResetEmail(
        user.email,
        user.name,
        resetUrl,
      );

      console.log(`✅ E-mail de reset enviado para: ${normalizedEmail}`);

      return {
        success: true,
        message:
          "Se o e-mail estiver cadastrado, você receberá um link de recuperação.",
      };
    } catch (error) {
      console.error("❌ Erro ao processar reset de senha:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Erro ao processar solicitação",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Valida token de reset de senha
   * POST /email/validate-reset-token
   * @IsPublic - Não requer autenticação
   */
  @IsPublic()
  @Post("validate-reset-token")
  async validateResetToken(@Body() body: { token: string; email: string }) {
    try {
      const { token, email } = body;

      if (!token || !email) {
        throw new HttpException(
          "Token e e-mail são obrigatórios",
          HttpStatus.BAD_REQUEST,
        );
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Criar hash do token recebido para comparar com o armazenado
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      // Buscar usuário com token válido
      const user = await this.userRepository.findOne({
        where: {
          email: normalizedEmail,
          resetPasswordToken: tokenHash,
        },
      });

      if (!user) {
        throw new HttpException(
          "Token inválido ou expirado",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Verificar se o token não expirou
      if (
        !user.resetPasswordExpires ||
        user.resetPasswordExpires < new Date()
      ) {
        throw new HttpException("Token expirado", HttpStatus.BAD_REQUEST);
      }

      return {
        success: true,
        message: "Token válido",
        userName: user.name,
      };
    } catch (error) {
      console.error("❌ Erro ao validar token:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Erro ao validar token",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Redefine a senha do usuário
   * POST /email/reset-password
   * @IsPublic - Não requer autenticação
   */
  @IsPublic()
  @Post("reset-password")
  async resetPassword(
    @Body() body: { token: string; email: string; newPassword: string },
  ) {
    try {
      const { token, email, newPassword } = body;

      if (!token || !email || !newPassword) {
        throw new HttpException(
          "Todos os campos são obrigatórios",
          HttpStatus.BAD_REQUEST,
        );
      }

      if (newPassword.length < 6) {
        throw new HttpException(
          "A senha deve ter no mínimo 6 caracteres",
          HttpStatus.BAD_REQUEST,
        );
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Criar hash do token recebido
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

      // Buscar usuário com token válido
      const user = await this.userRepository.findOne({
        where: {
          email: normalizedEmail,
          resetPasswordToken: tokenHash,
        },
      });

      if (!user) {
        throw new HttpException(
          "Token inválido ou expirado",
          HttpStatus.BAD_REQUEST,
        );
      }

      // Verificar se o token não expirou
      if (
        !user.resetPasswordExpires ||
        user.resetPasswordExpires < new Date()
      ) {
        throw new HttpException("Token expirado", HttpStatus.BAD_REQUEST);
      }

      // Hash da nova senha (usando bcrypt)
      const bcrypt = await import("bcrypt");
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Atualizar senha e limpar tokens de reset
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;

      await this.userRepository.save(user);

      // Enviar e-mail de confirmação de alteração
      await this.emailService.sendPasswordChangedConfirmation(
        user.email,
        user.name,
      );

      console.log(`✅ Senha alterada com sucesso para: ${normalizedEmail}`);

      return {
        success: true,
        message: "Senha alterada com sucesso",
      };
    } catch (error) {
      console.error("❌ Erro ao redefinir senha:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Erro ao redefinir senha",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ============================================
  // ENDPOINTS PROTEGIDOS
  // ============================================

  /**
   * Envia e-mail de confirmação de pagamento
   * POST /email/payment-confirmation
   * Requer autenticação
   */
  @Post("payment-confirmation")
  async sendPaymentConfirmation(
    @Body()
    body: {
      userId: number;
      planoId: number;
      planoNome: string;
      valor: number;
      paymentMethod: string;
      transactionId?: string;
    },
  ) {
    try {
      const { userId, planoNome, valor, paymentMethod, transactionId } = body;

      // Buscar dados do usuário
      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND);
      }

      // Enviar e-mail de confirmação de pagamento
      await this.emailService.sendPaymentConfirmation(user.email, user.name, {
        planoNome,
        valor,
        paymentMethod,
        transactionId,
      });

      return {
        success: true,
        message: "E-mail de confirmação enviado com sucesso",
      };
    } catch (error) {
      console.error("Erro ao enviar e-mail de confirmação:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Erro ao enviar e-mail de confirmação",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Envia e-mail de teste
   * POST /email/test
   * Requer autenticação
   */
  @Post("test")
  async sendTestEmail(@Body() body: { email: string }) {
    try {
      const { email } = body;

      if (!email) {
        throw new HttpException("E-mail não fornecido", HttpStatus.BAD_REQUEST);
      }

      await this.emailService.sendTestEmail(email);

      return {
        success: true,
        message: "E-mail de teste enviado com sucesso",
      };
    } catch (error) {
      console.error("Erro ao enviar e-mail de teste:", error);

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        "Erro ao enviar e-mail de teste",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Testa o envio de e-mail de verificação (para debug)
   * POST /email/test-verification
   * @IsPublic - Não requer autenticação
   */
  @IsPublic()
  @Post("test-verification")
  async testEmailVerification(@Body() body: { email: string; name?: string }) {
    try {
      const { email, name = "Usuário Teste" } = body;

      if (!email) {
        throw new HttpException("E-mail não fornecido", HttpStatus.BAD_REQUEST);
      }

      console.log(
        `🧪 TESTE: Iniciando envio de e-mail de verificação para: ${email}`,
      );

      // Criar URL de teste
      const frontendUrl = process.env.FRONTEND_URL || "https://indiqx.club";
      const testToken = "test-token-" + crypto.randomBytes(16).toString("hex");
      const confirmationUrl = `${frontendUrl}/confirm-email?token=${testToken}`;

      console.log(`🧪 TESTE: URL de confirmação: ${confirmationUrl}`);

      // Tentar enviar e-mail de verificação
      await this.emailService.sendEmailVerification(
        email,
        name,
        confirmationUrl,
      );

      console.log(
        `🧪 TESTE: E-mail de verificação enviado com sucesso para: ${email}`,
      );

      return {
        success: true,
        message: "E-mail de verificação de teste enviado com sucesso",
        email,
        confirmationUrl,
        token: testToken,
      };
    } catch (error) {
      console.error(
        "🧪 TESTE: Erro detalhado ao enviar e-mail de verificação:",
        error,
      );

      return {
        success: false,
        message: "Erro ao enviar e-mail de verificação de teste",
        error: error.message,
        details: {
          message: error.message,
          code: error.code,
          response: error.response,
          stack: error.stack,
        },
      };
    }
  }
}
