// test-email-verification.js - Script para testar o envio de e-mail de verificação
const nodemailer = require("nodemailer");
require("dotenv").config({
  path: "/Users/danielcarvalho/Projetos/saude-flow/app-saudeflow/api/.env",
});

async function testEmailVerification() {
  console.log("🧪 Iniciando teste de e-mail de verificação...");

  // Verificar variáveis de ambiente
  console.log("📋 Variáveis de ambiente:");
  console.log("SMTP_HOST:", process.env.SMTP_HOST);
  console.log("SMTP_PORT:", process.env.SMTP_PORT);
  console.log("SMTP_USER:", process.env.SMTP_USER);
  console.log("SMTP_PASS:", process.env.SMTP_PASS ? "***" : "NÃO DEFINIDO");
  console.log("FRONTEND_URL:", process.env.FRONTEND_URL);

  let transporter;

  try {
    // Criar transporter
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp-relay.sendinblue.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    console.log("📤 Configuração do transporter:", {
      host: process.env.SMTP_HOST || "smtp-relay.sendinblue.com",
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ? "***" : "NÃO DEFINIDO",
      },
    });

    // Verificar conexão
    console.log("🔍 Verificando conexão SMTP...");
    await transporter.verify();
    console.log("✅ Conexão SMTP verificada com sucesso!");

    // Criar e-mail de verificação
    const email = "teste@example.com";
    const name = "Usuário Teste";
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3005";
    const testToken =
      "test-token-" + require("crypto").randomBytes(16).toString("hex");
    const confirmationUrl = `${frontendUrl}/confirm-email?token=${testToken}`;

    console.log(`📧 Preparando e-mail para: ${email}`);
    console.log(`🔗 URL de confirmação: ${confirmationUrl}`);

    // Template HTML do e-mail de verificação (simplificado)
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
          .container { background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .button { display: inline-block; padding: 15px 30px; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; text-align: center; }
          .footer { text-align: center; padding-top: 20px; margin-top: 30px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Olá, ${name}!</h2>
          <p>Obrigado por se cadastrar no <strong>Saúde Flow</strong>.</p>
          <p>Para ativar sua conta, por favor confirme seu endereço de e-mail clicando no botão abaixo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" class="button">Confirmar E-mail</a>
          </div>
          <p>Ou copie e cole este link no seu navegador:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #6b7280;">${confirmationUrl}</div>
          <div class="footer">
            <p><strong>© ${new Date().getFullYear()} Saúde Flow</strong></p>
            <p>Este é um e-mail automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Configurar e-mail
    const mailOptions = {
      from: '"Saúde Flow" <noreply@saudeflow.app>',
      to: email,
      subject: "Confirme seu e-mail - Saúde Flow",
      html: htmlTemplate,
    };

    console.log(
      "📤 Enviando e-mail com opções:",
      JSON.stringify(
        {
          from: mailOptions.from,
          to: mailOptions.to,
          subject: mailOptions.subject,
          htmlLength: mailOptions.html.length,
        },
        null,
        2
      )
    );

    // Enviar e-mail
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ E-mail enviado com sucesso!");
    console.log("📊 Informações do envio:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      pending: info.pending,
      response: info.response,
    });
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
    if (error.response) {
      console.error("Resposta do servidor:", error.response);
    }
    if (error.responseCode) {
      console.error("Código de resposta:", error.responseCode);
    }
  } finally {
    // Fechar conexão
    if (transporter) {
      await transporter.close();
      console.log("🔒 Conexão SMTP fechada.");
    }
  }
}

// Executar teste
testEmailVerification().catch(console.error);
