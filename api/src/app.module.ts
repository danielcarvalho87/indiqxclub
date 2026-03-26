/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { ClientesModule } from "./clientes/clientes.module";
import { BonificacoesModule } from "./bonificacoes/bonificacoes.module";
import { ConfiguracoesModule } from "./configuracoes/configuracoes.module";

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  imports: [
    ConfigModule.forRoot(),
    UserModule,
    AuthModule,
    ClientesModule,
    BonificacoesModule,
    ConfiguracoesModule,
  ],
  exports: [AppService],
})
export class AppModule {}
