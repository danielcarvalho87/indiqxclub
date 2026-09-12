import { Module } from "@nestjs/common";
import { DatabaseModule } from "../database/database.module";
import { PlanosController } from "./planos.controller";
import { PlanosService } from "./planos.service";
import { planosProviders } from "./planos.providers";

@Module({
  imports: [DatabaseModule],
  controllers: [PlanosController],
  providers: [...planosProviders, PlanosService],
  exports: [PlanosService],
})
export class PlanosModule {}
