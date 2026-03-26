import { DataSource } from 'typeorm';
import { Bonificacao } from './entities/bonificacao.entity';

export const bonificacoesProviders = [
  {
    provide: 'BONIFICACAO_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Bonificacao),
    inject: ['DATA_SOURCE'],
  },
];
