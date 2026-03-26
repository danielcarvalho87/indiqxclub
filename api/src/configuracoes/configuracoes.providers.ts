import { DataSource } from "typeorm";
import { Configuracao } from "./entities/configuracao.entity";

export const configuracoesProviders = [
  {
    provide: "CONFIGURACAO_REPOSITORY",
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(Configuracao),
    inject: ["DATA_SOURCE"],
  },
];
