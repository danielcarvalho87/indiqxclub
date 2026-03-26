import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { ConfiguracoesController } from "./configuracoes.controller";
import { ConfiguracoesService } from "./configuracoes.service";
import { configuracoesProviders } from "./configuracoes.providers";

@Module({
  imports: [DatabaseModule],
  controllers: [ConfiguracoesController],
  providers: [...configuracoesProviders, ConfiguracoesService],
  exports: [ConfiguracoesService],
})
export class ConfiguracoesModule {}
