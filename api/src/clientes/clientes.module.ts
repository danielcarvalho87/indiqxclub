import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { DatabaseModule } from '../database/database.module';
import { clientesProviders } from './clientes.providers';
import { EmailModule } from '../email/email.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [DatabaseModule, EmailModule, UserModule],
  controllers: [ClientesController],
  providers: [
    ...clientesProviders,
    ClientesService
  ],
})
export class ClientesModule {}
