// email.module.ts
// Módulo de e-mail com suporte a reset de senha e notificações
// Localização: src/email/email.module.ts

import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { JwtModule } from "@nestjs/jwt";
import { EmailService } from "./email.service";
import { EmailController } from "./email.controller";
import { DatabaseModule } from "../database/database.module";
import { userProviders } from "../user/user.provider";

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || "indiqxclub-secret-key",
      signOptions: { expiresIn: "1h" },
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: `"${process.env.SMTP_FROM_NAME || 'Indiqx Club'}" <${process.env.SMTP_FROM_EMAIL || 'noreply@indiqx.club'}>`,
      },
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService, ...userProviders],
  exports: [EmailService],
})
export class EmailModule { }