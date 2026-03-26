import { Module } from '@nestjs/common';
import { BonificacoesService } from './bonificacoes.service';
import { BonificacoesController } from './bonificacoes.controller';
import { DatabaseModule } from '../database/database.module';
import { bonificacoesProviders } from './bonificacoes.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [BonificacoesController],
  providers: [
    ...bonificacoesProviders,
    BonificacoesService,
  ],
})
export class BonificacoesModule {}
