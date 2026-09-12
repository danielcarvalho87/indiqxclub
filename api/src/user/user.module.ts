// user.module.ts (ATUALIZADO)
// Módulo de usuários com EmailModule integrado
// Localização: src/user/user.module.ts

import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { PublicUserController } from "./public-user.controller";
import { DatabaseModule } from "../database/database.module";
import { EmailModule } from "../email/email.module"; // IMPORTAR EmailModule
import { ConfiguracoesModule } from "../configuracoes/configuracoes.module";
import { AssinaturasModule } from "../assinaturas/assinaturas.module";
import { userProviders } from "./user.provider";

@Module({
  imports: [
    DatabaseModule,
    EmailModule, // ADICIONAR EmailModule
    ConfiguracoesModule, // ADICIONAR ConfiguracoesModule
    // Valida o teto de parceiros do plano antes de ativar uma conta.
    AssinaturasModule,
  ],
  controllers: [UserController, PublicUserController],
  providers: [...userProviders, UserService],
  exports: [UserService],
})
export class UserModule {}
