import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { AssinaturasController } from "./assinaturas.controller";
import { AssinaturasService } from "./assinaturas.service";
import { assinaturasProviders } from "./assinaturas.providers";
import { userProviders } from "../user/user.provider";
import { PlanosModule } from "../planos/planos.module";

/**
 * Usa o repositório de usuários diretamente (userProviders) em vez de
 * importar o UserModule: o UserModule depende deste módulo para validar o
 * limite de parceiros, e a importação nos dois sentidos criaria um ciclo.
 */
@Module({
  imports: [DatabaseModule, PlanosModule],
  controllers: [AssinaturasController],
  providers: [...assinaturasProviders, ...userProviders, AssinaturasService],
  exports: [AssinaturasService],
})
export class AssinaturasModule {}
