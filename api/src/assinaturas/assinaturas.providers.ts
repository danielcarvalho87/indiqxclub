import { DataSource } from "typeorm";
import { Assinatura } from "./entities/assinatura.entity";

export const assinaturasProviders = [
  {
    provide: "ASSINATURA_REPOSITORY",
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Assinatura),
    inject: ["DATA_SOURCE"],
  },
];
