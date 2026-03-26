import { DataSource } from "typeorm";

export const databaseProviders = [
  {
    provide: "DATA_SOURCE",
    useFactory: async () => {
      const dataSource = new DataSource({
        type: "mysql",
        host: process.env.DATABASE_HOST,
        port: 3306,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
        database: process.env.DATABASE_DB,
        entities: [__dirname + "/../**/*.entity{.ts,.js}"],
        synchronize: false, // Desativado para evitar criação automática de constraints
      });

      return dataSource.initialize();
    },
  },
];
