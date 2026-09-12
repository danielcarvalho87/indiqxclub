import { DataSource } from "typeorm";
import { Plano } from "./entities/plano.entity";

export const planosProviders = [
  {
    provide: "PLANO_REPOSITORY",
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Plano),
    inject: ["DATA_SOURCE"],
  },
];
