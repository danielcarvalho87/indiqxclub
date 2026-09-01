/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./auth/roles/roles.guard";
import { ClientesModule } from "./clientes/clientes.module";
import { BonificacoesModule } from "./bonificacoes/bonificacoes.module";
import { ConfiguracoesModule } from "./configuracoes/configuracoes.module";

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot(),
    // Limite global: 120 requisições por minuto por IP.
    // Rotas sensíveis (login, reset de senha) usam @Throttle com limites menores.
    ThrottlerModule.forRoot([
      {
        name: "default",
        ttl: 60000,
        limit: 120,
      },
    ]),
    UserModule,
    AuthModule,
    ClientesModule,
    BonificacoesModule,
    ConfiguracoesModule,
  ],
  exports: [AppService],
})
export class AppModule {}
