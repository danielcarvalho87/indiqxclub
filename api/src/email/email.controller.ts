// email.controller.ts
// Controller de e-mail (apenas rotas autenticadas)
// Localização: src/email/email.controller.ts
//
// O fluxo de reset de senha vive inteiramente em PublicUserController
// (/public/user/forgot-password e /public/user/reset-password). Havia aqui
// uma segunda implementação que gravava o token na mesma coluna com um
// formato diferente, deixando os dois fluxos mutuamente incompatíveis.

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
import { Roles } from "../auth/roles/roles.decorator";
import { AccessLevel } from "../auth/roles/level.util";

@Controller("email")
export class EmailController {
  constructor(
    private readonly emailService: EmailService,
    @Inject("USER_REPOSITORY")
    private userRepository: Repository<User>,
  ) {}

  /**
   * Envia e-mail de confirmação de pagamento
   * POST /email/payment-confirmation
   */
  @Post("payment-confirmation")
  @Roles(AccessLevel.FullAdmin, AccessLevel.Admin)
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

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException("Usuário não encontrado", HttpStatus.NOT_FOUND);
      }

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
      if (error instanceof HttpException) {
        throw error;
      }

      console.error("Erro ao enviar e-mail de confirmação:", error);

      throw new HttpException(
        "Erro ao enviar e-mail de confirmação",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Envia e-mail de teste (diagnóstico de SMTP)
   * POST /email/test
   */
  @Post("test")
  @Roles(AccessLevel.FullAdmin)
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
      if (error instanceof HttpException) {
        throw error;
      }

      console.error("Erro ao enviar e-mail de teste:", error);

      throw new HttpException(
        "Erro ao enviar e-mail de teste",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
