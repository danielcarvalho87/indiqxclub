// email.service.ts (ATUALIZADO)
// Service responsável pelo envio de e-mails de validação, notificações, pagamentos e reset de senha
// Localização: src/email/email.service.ts

import { Injectable } from "@nestjs/common";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  /**
   * Envia e-mail de verificação de conta
   * @param email E-mail do destinatário
   * @param name Nome do destinatário
   * @param confirmationUrl URL de confirmação com token
   */
  async sendEmailVerification(
    email: string,
    name: string,
    confirmationUrl: string,
  ): Promise<void> {
    console.log(`📧 Iniciando envio de e-mail para: ${email}`);
    console.log(`🔗 URL de confirmação: ${confirmationUrl}`);

    try {
      const mailOptions = {
        to: email,
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: "Confirme seu e-mail - Indiqx Club",
        html: this.getEmailVerificationTemplate(name, confirmationUrl),
      };

      console.log(
        `📤 Enviando e-mail com opções:`,
        JSON.stringify(mailOptions, null, 2),
      );

      await this.mailerService.sendMail(mailOptions);

      console.log(`✅ E-mail de validação enviado com sucesso para: ${email}`);
    } catch (error) {
      console.error("❌ Erro detalhado ao enviar e-mail:");
      console.error("Erro completo:", error);
      console.error("Mensagem:", error.message);
      console.error("Stack:", error.stack);

      if (error.code) {
        console.error("Código do erro:", error.code);
      }
      if (error.command) {
        console.error("Comando:", error.command);
      }

      throw new Error(`Erro ao enviar e-mail de verificação: ${error.message}`);
    }
  }

  /**
   * Envia e-mail de reset de senha
   * @param email E-mail do destinatário
   * @param name Nome do destinatário
   * @param resetUrl URL de reset com token
   */
  async sendPasswordResetEmail(
    email: string,
    name: string,
    resetUrl: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: "🔐 Redefinição de Senha - Indiqx Club",
        html: this.getPasswordResetTemplate(name, resetUrl),
      });

      console.log(`✅ E-mail de reset de senha enviado para: ${email}`);
    } catch (error) {
      console.error("❌ Erro ao enviar e-mail de reset:", error);
      throw new Error("Erro ao enviar e-mail de reset de senha");
    }
  }

  /**
   * Envia e-mail de confirmação de alteração de senha
   * @param email E-mail do destinatário
   * @param name Nome do destinatário
   */
  async sendPasswordChangedConfirmation(
    email: string,
    name: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: "✅ Senha Alterada com Sucesso - Indiqx Club",
        html: this.getPasswordChangedTemplate(name),
      });

      console.log(
        `✅ E-mail de confirmação de alteração enviado para: ${email}`,
      );
    } catch (error) {
      console.error("❌ Erro ao enviar e-mail de confirmação:", error);
      // Não lança erro pois é um e-mail de notificação
    }
  }

  /**
   * Envia e-mail de boas-vindas para parceiro com o nome da empresa
   * @param email E-mail do parceiro
   * @param name Nome do parceiro
   * @param companyName Nome da empresa (master)
   */
  async sendPartnerRegistrationEmail(
    email: string,
    name: string,
    companyName: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: `Bem-vindo à rede de parceiros da ${companyName}! - Indiqx Club`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #3b82f6;">Cadastro Realizado!</h1>
            </div>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <p>Olá, <strong>${name}</strong>!</p>
              <p>Seu cadastro como parceiro da empresa <strong>${companyName}</strong> foi recebido com sucesso no Indiqx Club.</p>
              <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #fde68a;">
                <p style="margin: 5px 0; color: #92400e;"><strong>Status Atual:</strong> Em Análise (Inativo)</p>
              </div>
              <p>Seu acesso está aguardando a aprovação do administrador da empresa. Você receberá um novo e-mail assim que seu acesso for liberado.</p>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
              <p>Este é um e-mail automático do Indiqx Club</p>
            </div>
          </div>
        `,
      });
      console.log(`✅ E-mail de registro de parceiro enviado para: ${email}`);
    } catch (error) {
      console.error("❌ Erro ao enviar e-mail de registro de parceiro:", error);
    }
  }

  /**
   * Envia notificação de ativação de parceiro
   * @param email E-mail do parceiro
   * @param name Nome do parceiro
   */
  async sendPartnerActivationEmail(
    email: string,
    name: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: "✅ Conta Ativada! - Indiqx Club",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #10b981;">Conta Ativada!</h1>
            </div>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <p>Olá, <strong>${name}</strong>!</p>
              <p>Ótimas notícias! O administrador aprovou seu cadastro e sua conta agora está <strong>Ativa</strong>.</p>
              <p>Você já pode acessar o painel do Indiqx Club e começar a indicar clientes.</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://indiqx.club/login" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Acessar Painel</a>
              </div>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
              <p>Este é um e-mail automático do Indiqx Club</p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Notificação de ativação de parceiro enviada para: ${email}`);
    } catch (error) {
      console.error("❌ Erro ao enviar notificação de ativação de parceiro:", error);
    }
  }

  /**
   * Envia notificação de novo cliente indicado (para o administrador do parceiro)
   * @param email E-mail do destinatário (administrador)
   * @param adminName Nome do administrador
   * @param clientName Nome do cliente
   * @param partnerName Nome do parceiro que indicou
   */
  async sendNewClientIndicatedNotification(
    email: string,
    adminName: string,
    clientName: string,
    partnerName: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: "🎉 Novo Cliente Indicado - Indiqx Club",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #3b82f6;">Novo Cliente Indicado!</h1>
            </div>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <p>Olá, <strong>${adminName}</strong>!</p>
              <p>Um novo cliente foi indicado na sua rede.</p>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
                <p style="margin: 5px 0;"><strong>Cliente:</strong> ${clientName}</p>
                <p style="margin: 5px 0;"><strong>Parceiro que indicou:</strong> ${partnerName}</p>
              </div>
              <p>Acesse o painel do Indiqx Club para ver mais detalhes.</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://indiqx.club/login" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Acessar Painel</a>
              </div>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
              <p>Este é um e-mail automático do Indiqx Club</p>
            </div>
          </div>
        `,
      });
      console.log(
        `✅ Notificação de novo cliente indicado enviada para: ${email}`,
      );
    } catch (error) {
      console.error(
        "❌ Erro ao enviar notificação de novo cliente indicado:",
        error,
      );
    }
  }

  /**
   * Envia notificação de contrato fechado (para administrador e parceiro)
   * @param email E-mail do destinatário
   * @param recipientName Nome do destinatário
   * @param clientName Nome do cliente que fechou contrato
   * @param value Valor do contrato
   */
  async sendClientContractClosedNotification(
    email: string,
    recipientName: string,
    clientName: string,
    value: number,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: "💰 Contrato Fechado! - Indiqx Club",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #10b981;">Contrato Fechado!</h1>
            </div>
            <div style="background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
              <p>Olá, <strong>${recipientName}</strong>!</p>
              <p>Ótimas notícias! Um contrato foi fechado com sucesso.</p>
              <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin: 15px 0; border: 1px solid #a7f3d0;">
                <p style="margin: 5px 0;"><strong>Cliente:</strong> ${clientName}</p>
                <p style="margin: 5px 0;"><strong>Valor:</strong> R$ ${Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
              </div>
              <p>Acesse o painel do Indiqx Club para acompanhar as comissões e pontuações.</p>
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://indiqx.club/login" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Acessar Painel</a>
              </div>
            </div>
            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
              <p>Este é um e-mail automático do Indiqx Club</p>
            </div>
          </div>
        `,
      });
      console.log(`✅ Notificação de contrato fechado enviada para: ${email}`);
    } catch (error) {
      console.error(
        "❌ Erro ao enviar notificação de contrato fechado:",
        error,
      );
    }
  }

  /**
   * Envia notificação de novo lead
   * @param email E-mail do destinatário (dono do lead)
   * @param name Nome do destinatário
   * @param leadName Nome do lead criado
   */
  async sendNewLeadNotification(
    email: string,
    name: string,
    leadName: string,
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: "🚀 Novo Lead Recebido - Indiqx Club",
        html: this.getNewLeadTemplate(name, leadName),
      });

      console.log(`✅ Notificação de novo lead enviada para: ${email}`);
    } catch (error) {
      console.error("❌ Erro ao enviar notificação de lead:", error);
    }
  }

  /**
   * Template HTML da notificação de novo lead
   */
  private getNewLeadTemplate(name: string, leadName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message {
            color: #4b5563;
            margin-bottom: 20px;
            font-size: 15px;
          }
          .lead-box {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
          }
          .lead-name {
            color: #1e40af;
            font-weight: 700;
            font-size: 20px;
            margin-top: 5px;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
          }
          .footer {
            background-color: #f9fafb;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            color: #6b7280;
            font-size: 13px;
            margin: 5px 0;
          }
          .brand {
            color: #3b82f6;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">🚀</div>
            <h1>Novo Lead Recebido!</h1>
          </div>

          <div class="content">
            <div class="greeting">
              Olá, ${name}!
            </div>

            <div class="message">
              Você acabou de receber um novo cadastro no seu CRM do <strong>Indiqx Club</strong>.
            </div>

            <div class="lead-box">
              <div>Novo Contato:</div>
              <div class="lead-name">${leadName}</div>
            </div>

            <div class="message">
              Acesse o sistema agora para ver todos os detalhes e entrar em contato.
            </div>

            <div class="button-container">
              <a href="https://indiqx.club/login" class="button">Ver Lead</a>
            </div>
          </div>

          <div class="footer">
            <div class="footer-text">
              Este é um e-mail automático do <span class="brand">Indiqx Club</span>
            </div>
            <div class="footer-text">
              © ${new Date().getFullYear()} Indiqx Club - Todos os direitos reservados
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML do e-mail de reset de senha
   */
  private getPasswordResetTemplate(name: string, resetUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message {
            color: #4b5563;
            margin-bottom: 20px;
            font-size: 15px;
          }
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 14px rgba(20, 184, 166, 0.4);
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(20, 184, 166, 0.5);
          }
          .link-box {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
            font-size: 12px;
            color: #6b7280;
            border: 1px dashed #d1d5db;
          }
          .link-label {
            font-size: 12px;
            color: #9ca3af;
            margin-bottom: 8px;
            display: block;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 25px 0;
            border-radius: 4px;
          }
          .warning-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 5px;
          }
          .warning-text {
            color: #78350f;
            font-size: 14px;
          }
          .security-box {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .security-title {
            font-weight: 600;
            color: #991b1b;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .security-text {
            color: #7f1d1d;
            font-size: 14px;
          }
          .footer {
            background-color: #f9fafb;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            color: #6b7280;
            font-size: 13px;
            margin: 5px 0;
          }
          .brand {
            color: #14b8a6;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">🔐</div>
            <h1>Redefinição de Senha</h1>
          </div>

          <div class="content">
            <div class="greeting">
              Olá, ${name}!
            </div>

            <div class="message">
              Recebemos uma solicitação para redefinir a senha da sua conta no <strong>Indiqx Club</strong>.
            </div>

            <div class="message">
              Para criar uma nova senha, clique no botão abaixo:
            </div>

            <div class="button-container">
              <a href="${resetUrl}" class="button">Redefinir Minha Senha</a>
            </div>

            <div class="link-label">Ou copie e cole este link no seu navegador:</div>
            <div class="link-box">
              ${resetUrl}
            </div>

            <div class="warning">
              <div class="warning-title">⏰ Atenção:</div>
              <div class="warning-text">
                Este link é válido por <strong>1 hora</strong>. Após esse período, você precisará solicitar uma nova redefinição.
              </div>
            </div>

            <div class="security-box">
              <div class="security-title">
                🛡️ Não solicitou esta alteração?
              </div>
              <div class="security-text">
                Se você não solicitou a redefinição de senha, por favor ignore este e-mail.
                Sua senha permanecerá inalterada e o link expirará automaticamente.
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="footer-text">
              Este é um e-mail automático do <span class="brand">Indiqx Club</span>
            </div>
            <div class="footer-text">
              Por favor, não responda a esta mensagem
            </div>
            <div class="footer-text" style="margin-top: 15px;">
              © ${new Date().getFullYear()} Indiqx Club - Todos os direitos reservados
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML do e-mail de confirmação de alteração de senha
   */
  private getPasswordChangedTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message {
            color: #4b5563;
            margin-bottom: 20px;
            font-size: 15px;
          }
          .success-box {
            background-color: #d1fae5;
            border: 1px solid #6ee7b7;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
          }
          .success-icon {
            font-size: 40px;
            margin-bottom: 10px;
          }
          .success-text {
            color: #065f46;
            font-weight: 600;
            font-size: 16px;
          }
          .security-box {
            background-color: #fef3c7;
            border: 1px solid #fcd34d;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .security-title {
            font-weight: 600;
            color: #92400e;
            margin-bottom: 10px;
          }
          .security-text {
            color: #78350f;
            font-size: 14px;
          }
          .footer {
            background-color: #f9fafb;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            color: #6b7280;
            font-size: 13px;
            margin: 5px 0;
          }
          .brand {
            color: #14b8a6;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">✅</div>
            <h1>Senha Alterada com Sucesso</h1>
          </div>

          <div class="content">
            <div class="greeting">
              Olá, ${name}!
            </div>

            <div class="success-box">
              <div class="success-icon">🔒</div>
              <div class="success-text">
                Sua senha foi alterada com sucesso!
              </div>
            </div>

            <div class="message">
              Este e-mail é uma confirmação de que a senha da sua conta no <strong>Indiqx Club</strong> foi alterada recentemente.
            </div>

            <div class="message">
              Você já pode acessar sua conta com a nova senha.
            </div>

            <div class="security-box">
              <div class="security-title">⚠️ Não foi você?</div>
              <div class="security-text">
                Se você não realizou esta alteração, sua conta pode estar comprometida.
                Entre em contato imediatamente conosco através do e-mail
                <a href="mailto:suporte@indiqx.club" style="color: #14b8a6;">suporte@indiqx.club</a>
              </div>
            </div>
          </div>

          <div class="footer">
            <div class="footer-text">
              Este é um e-mail automático do <span class="brand">Indiqx Club</span>
            </div>
            <div class="footer-text">
              Por favor, não responda a esta mensagem
            </div>
            <div class="footer-text" style="margin-top: 15px;">
              © ${new Date().getFullYear()} Indiqx Club - Todos os direitos reservados
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envia e-mail de boas-vindas após confirmação
   * @param email E-mail do destinatário
   * @param name Nome do destinatário
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: "Bem-vindo ao Indiqx Club!",
        html: this.getWelcomeEmailTemplate(name),
      });

      console.log(`✅ E-mail de boas-vindas enviado para: ${email}`);
    } catch (error) {
      console.error("❌ Erro ao enviar e-mail de boas-vindas:", error);
      // Não lança erro pois é um e-mail opcional
    }
  }

  /**
   * Envia e-mail de confirmação de pagamento
   * @param email E-mail do destinatário
   * @param name Nome do destinatário
   * @param paymentData Dados do pagamento
   */
  async sendPaymentConfirmation(
    email: string,
    name: string,
    paymentData: {
      planoNome: string;
      valor: number;
      paymentMethod: string;
      transactionId?: string;
    },
  ): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: "✅ Pagamento Confirmado - Indiqx Club",
        html: this.getPaymentConfirmationTemplate(name, paymentData),
      });

      console.log(
        `✅ E-mail de confirmação de pagamento enviado para: ${email}`,
      );
    } catch (error) {
      console.error(
        "❌ Erro ao enviar e-mail de confirmação de pagamento:",
        error,
      );
      throw new Error("Erro ao enviar e-mail de confirmação de pagamento");
    }
  }

  /**
   * Template HTML do e-mail de verificação
   */
  private getEmailVerificationTemplate(
    name: string,
    confirmationUrl: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 3px solid #14b8a6;
            margin-bottom: 30px;
          }
          .logo {
            max-width: 200px;
          }
          .content {
            padding: 20px 0;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background-color: #3b82f6;
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .button:hover {
            background-color: #2563eb;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .link-box {
            background-color: #f3f4f6;
            padding: 15px;
            border-radius: 4px;
            margin: 15px 0;
            word-break: break-all;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://indiqx.club/assets/INDIQX-CLUB-MARCA.png" alt="Indiqx Club" class="logo">
          </div>

          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Olá, ${name}!</h2>

            <p>Obrigado por se cadastrar no <strong>Indiqx Club</strong>.</p>

            <p>Para ativar sua conta e continuar para o checkout, por favor confirme seu endereço de e-mail clicando no botão abaixo:</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${confirmationUrl}" class="button">Confirmar E-mail</a>
            </div>

            <p style="margin-top: 20px;">Ou copie e cole o link abaixo no seu navegador:</p>
            <div class="link-box">
              ${confirmationUrl}
            </div>

            <div class="warning">
              <strong>⏰ Atenção:</strong> Este link expira em 24 horas.
            </div>

            <p>Se você não solicitou este cadastro, por favor ignore este e-mail.</p>
          </div>

          <div class="footer">
            <p><strong>© ${new Date().getFullYear()} Indiqx Club</strong></p>
            <p>Este é um e-mail automático, por favor não responda.</p>
            <p style="margin-top: 10px;">
              <a href="https://indiqx.club" style="color: #6b7280; text-decoration: none;">www.indiqx.club</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML do e-mail de boas-vindas
   */
  private getWelcomeEmailTemplate(name: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 3px solid #14b8a6;
            margin-bottom: 30px;
          }
          .content {
            padding: 20px 0;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://indiqx.club/assets/INDIQX-CLUB-MARCA.png" alt="Indiqx Club" style="max-width: 200px;">
          </div>

          <div class="content">
            <h2 style="color: #1f2937; margin-top: 0;">Bem-vindo ao Indiqx Club, ${name}! 🎉</h2>

            <p>Sua conta foi ativada com sucesso!</p>

            <p>Agora você tem acesso completo ao nosso sistema de indicações e recompensas.</p>

            <p>Estamos muito felizes em ter você conosco!</p>
          </div>

          <div class="footer">
            <p><strong>© ${new Date().getFullYear()} Indiqx Club</strong></p>
            <p>Este é um e-mail automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML do e-mail de confirmação de pagamento
   */
  private getPaymentConfirmationTemplate(
    name: string,
    paymentData: {
      planoNome: string;
      valor: number;
      paymentMethod: string;
      transactionId?: string;
    },
  ): string {
    const valorFormatado = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(paymentData.valor);

    const metodoPagamento =
      paymentData.paymentMethod === "PIX"
        ? "PIX"
        : paymentData.paymentMethod === "CREDIT_CARD"
          ? "Cartão de Crédito"
          : paymentData.paymentMethod;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 3px solid #10b981;
            margin-bottom: 30px;
          }
          .payment-details {
            background-color: #f0fdf4;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #d1fae5;
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .footer {
            text-align: center;
            padding-top: 20px;
            margin-top: 30px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="color: #10b981; margin: 0;">✅ Pagamento Confirmado!</h1>
          </div>

          <div class="content">
            <p>Olá, <strong>${name}</strong>!</p>

            <p>Seu pagamento foi processado com sucesso. Confira os detalhes abaixo:</p>

            <div class="payment-details">
              <div class="detail-row">
                <span><strong>Plano:</strong></span>
                <span>${paymentData.planoNome}</span>
              </div>
              <div class="detail-row">
                <span><strong>Valor:</strong></span>
                <span style="color: #10b981; font-weight: bold;">${valorFormatado}</span>
              </div>
              <div class="detail-row">
                <span><strong>Método:</strong></span>
                <span>${metodoPagamento}</span>
              </div>
              ${
                paymentData.transactionId
                  ? `
              <div class="detail-row">
                <span><strong>ID da Transação:</strong></span>
                <span style="font-family: monospace; font-size: 12px;">${paymentData.transactionId}</span>
              </div>
              `
                  : ""
              }
            </div>

            <p>Obrigado por escolher o Indiqx Club!</p>
          </div>

          <div class="footer">
            <p><strong>© ${new Date().getFullYear()} Indiqx Club</strong></p>
            <p>Este é um e-mail automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Envia e-mail de teste (útil para validar configuração SMTP)
   */
  async sendTestEmail(email: string): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: email,
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: "Teste de Envio de E-mail - Indiqx Club",
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Teste de Configuração SMTP</h2>
            <p>Este é um e-mail de teste para validar a configuração do servidor SMTP.</p>
            <p>Se você recebeu este e-mail, a configuração está funcionando corretamente! ✅</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Indiqx Club - Sistema de Indicações</p>
          </div>
        `,
      });

      console.log(`✅ E-mail de teste enviado para: ${email}`);
    } catch (error) {
      console.error("❌ Erro ao enviar e-mail de teste:", error);
      throw new Error("Falha ao enviar e-mail de teste");
    }
  }

  /**
   * Envia notificação de novo cadastro para a equipe administrativa
   * @param userName Nome do usuário que se cadastrou
   * @param userEmail E-mail do usuário que se cadastrou
   * @param userType Tipo de pessoa (física/jurídica)
   */
  async sendNewUserNotification(
    userName: string,
    userEmail: string,
    userType: string,
  ): Promise<void> {
    const adminEmails = [
      "appindiqxclub@gmail.com",
      "danielcdesign@gmail.com",
      "grabriel.dev.adv@gmail.com",
    ];

    try {
      await this.mailerService.sendMail({
        to: adminEmails.join(", "),
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: "Nova assinatura - em andamento",
        html: this.getNewUserNotificationTemplate(
          userName,
          userEmail,
          userType,
        ),
      });

      console.log(
        `✅ Notificação de novo cadastro enviada para: ${adminEmails.join(", ")}`,
      );
    } catch (error) {
      console.error("❌ Erro ao enviar notificação de novo cadastro:", error);
      // Não lança erro para não bloquear o fluxo do usuário
    }
  }

  /**
   * Envia notificação de pagamento confirmado para a equipe administrativa
   * @param userName Nome do usuário
   * @param userEmail E-mail do usuário
   * @param planName Nome do plano contratado
   * @param paymentValue Valor do pagamento
   */
  async sendPaymentConfirmedNotification(
    userName: string,
    userEmail: string,
    planName: string,
    paymentValue: number,
  ): Promise<void> {
    const adminEmails = [
      "appindiqxclub@gmail.com",
      "danielcdesign@gmail.com",
      "grabriel.dev.adv@gmail.com",
    ];

    try {
      await this.mailerService.sendMail({
        to: adminEmails.join(", "),
        from: '"Indiqx Club" <noreply@indiqx.club>',
        subject: `Nova assinatura ativa - ${userName}`,
        html: this.getPaymentConfirmedNotificationTemplate(
          userName,
          userEmail,
          planName,
          paymentValue,
        ),
      });

      console.log(
        `✅ Notificação de pagamento confirmado enviada para: ${adminEmails.join(", ")}`,
      );
    } catch (error) {
      console.error(
        "❌ Erro ao enviar notificação de pagamento confirmado:",
        error,
      );
      // Não lança erro para não bloquear o fluxo do usuário
    }
  }

  /**
   * Template HTML da notificação de novo cadastro
   */
  private getNewUserNotificationTemplate(
    userName: string,
    userEmail: string,
    userType: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message {
            color: #4b5563;
            margin-bottom: 20px;
            font-size: 15px;
          }
          .user-details {
            background-color: #fef3c7;
            border: 1px solid #fcd34d;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #fde68a;
          }
          .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .detail-label {
            font-weight: 600;
            color: #92400e;
          }
          .detail-value {
            color: #78350f;
            font-weight: 500;
          }
          .status-box {
            background-color: #dbeafe;
            border: 1px solid #93c5fd;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
          .status-icon {
            font-size: 32px;
            margin-bottom: 10px;
          }
          .status-text {
            color: #1e40af;
            font-weight: 600;
            font-size: 16px;
          }
          .footer {
            background-color: #f9fafb;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            color: #6b7280;
            font-size: 13px;
            margin: 5px 0;
          }
          .brand {
            color: #f59e0b;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">📋</div>
            <h1>Nova Assinatura - Em Andamento</h1>
          </div>

          <div class="content">
            <div class="greeting">
              Olá, equipe Indiqx Club!
            </div>

            <div class="message">
              Um novo usuário acabou de se cadastrar no sistema e está aguardando confirmação de pagamento.
            </div>

            <div class="user-details">
              <div class="detail-row">
                <span class="detail-label">Nome:</span>
                <span class="detail-value">${userName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">E-mail:</span>
                <span class="detail-value">${userEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Tipo:</span>
                <span class="detail-value">${userType === "juridica" ? "Pessoa Jurídica" : "Pessoa Física"}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Data do Cadastro:</span>
                <span class="detail-value">${new Date().toLocaleString("pt-BR")}</span>
              </div>
            </div>

            <div class="status-box">
              <div class="status-icon">⏳</div>
              <div class="status-text">
                Aguardando confirmação de pagamento
              </div>
            </div>

            <div class="message">
              Entre em contato com o usuário caso necessário e acompanhe o processo de ativação da assinatura.
            </div>
          </div>

          <div class="footer">
            <div class="footer-text">
              Este é um e-mail automático do <span class="brand">Indiqx Club</span>
            </div>
            <div class="footer-text">
              © ${new Date().getFullYear()} Indiqx Club - Todos os direitos reservados
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template HTML da notificação de pagamento confirmado
   */
  private getPaymentConfirmedNotificationTemplate(
    userName: string,
    userEmail: string,
    planName: string,
    paymentValue: number,
  ): string {
    const formattedValue = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(paymentValue);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
          }
          .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
          }
          .header-icon {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 18px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .message {
            color: #4b5563;
            margin-bottom: 20px;
            font-size: 15px;
          }
          .payment-details {
            background-color: #d1fae5;
            border: 1px solid #6ee7b7;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid #a7f3d0;
          }
          .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          .detail-label {
            font-weight: 600;
            color: #065f46;
          }
          .detail-value {
            color: #064e3b;
            font-weight: 500;
          }
          .success-box {
            background-color: #dcfce7;
            border: 1px solid #86efac;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
          .success-icon {
            font-size: 32px;
            margin-bottom: 10px;
          }
          .success-text {
            color: #166534;
            font-weight: 600;
            font-size: 16px;
          }
          .footer {
            background-color: #f9fafb;
            padding: 25px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
          }
          .footer-text {
            color: #6b7280;
            font-size: 13px;
            margin: 5px 0;
          }
          .brand {
            color: #10b981;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">🎉</div>
            <h1>Nova Assinatura Ativa - ${userName}</h1>
          </div>

          <div class="content">
            <div class="greeting">
              Olá, equipe Indiqx Club!
            </div>

            <div class="message">
              Ótima notícia! O pagamento foi confirmado e uma nova assinatura foi ativada.
            </div>

            <div class="success-box">
              <div class="success-icon">✅</div>
              <div class="success-text">
                Assinatura Ativada com Sucesso!
              </div>
            </div>

            <div class="payment-details">
              <div class="detail-row">
                <span class="detail-label">Nome do Cliente:</span>
                <span class="detail-value">${userName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">E-mail:</span>
                <span class="detail-value">${userEmail}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Plano Contratado:</span>
                <span class="detail-value">${planName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Valor do Pagamento:</span>
                <span class="detail-value">${formattedValue}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Data da Confirmação:</span>
                <span class="detail-value">${new Date().toLocaleString("pt-BR")}</span>
              </div>
            </div>

            <div class="message">
              O cliente já pode acessar todas as funcionalidades do sistema. Entre em contato para dar as boas-vindas e oferecer suporte inicial.
            </div>
          </div>

          <div class="footer">
            <div class="footer-text">
              Este é um e-mail automático do <span class="brand">Indiqx Club</span>
            </div>
            <div class="footer-text">
              © ${new Date().getFullYear()} Indiqx Club - Todos os direitos reservados
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
