// test-smtp.js
// Script para testar conectividade SMTP

const nodemailer = require("nodemailer");
require("dotenv").config({
  path: "/Users/danielcarvalho/Projetos/saude-flow/app-saudeflow/api/.env",
});

console.log("=== Teste de Conectividade SMTP ===");
console.log("Host:", process.env.SMTP_HOST);
console.log("Port:", process.env.SMTP_PORT);
console.log("User:", process.env.SMTP_USER);
console.log("Pass:", process.env.SMTP_PASS ? "***" : "NÃO CONFIGURADO");

const transporter = nodemailer.createTransport({
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

console.log("\n=== Verificando conexão... ===");

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Erro na conexão SMTP:", error.message);
    console.error("Stack:", error.stack);
  } else {
    console.log("✅ Conexão SMTP bem-sucedida!");
    console.log("Servidor pronto para enviar e-mails");
  }

  // Teste de envio
  console.log("\n=== Testando envio de e-mail ===");

  const mailOptions = {
    from: '"Saúde Flow Teste" <noreply@saudeflow.app>',
    to: "teste@example.com",
    subject: "Teste de SMTP - SaudeFlow",
    html: "<h1>Teste de SMTP</h1><p>Este é um e-mail de teste.</p>",
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Erro ao enviar e-mail:", error.message);
      console.error("Código:", error.code);
      console.error("Comando:", error.command);
    } else {
      console.log("✅ E-mail enviado com sucesso!");
      console.log("Message ID:", info.messageId);
    }

    process.exit(0);
  });
});
