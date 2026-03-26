import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { EmailService } from '../email/email.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ClientesService {
  constructor(
    @Inject('CLIENTE_REPOSITORY')
    private clienteRepository: Repository<Cliente>,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  async create(createClienteDto: CreateClienteDto) {
    const novoCliente = await this.clienteRepository.save(createClienteDto);

    // Enviar notificação de novo cliente indicado
    if (novoCliente.corretor_id) {
      try {
        const parceiro = await this.userService.findOne(novoCliente.corretor_id);
        if (parceiro && parceiro.master_id) {
          const admin = await this.userService.findOne(parceiro.master_id);
          if (admin && admin.email) {
            const clienteNome = `${novoCliente.nome} ${novoCliente.sobrenome || ''}`.trim();
            const parceiroNome = `${parceiro.name} ${parceiro.sobrenome || ''}`.trim();
            await this.emailService.sendNewClientIndicatedNotification(
              admin.email,
              admin.name,
              clienteNome,
              parceiroNome
            );
          }
        }
      } catch (error) {
        console.error("Erro ao enviar notificação de novo cliente:", error);
      }
    }

    return novoCliente;
  }

  findAll() {
    return this.clienteRepository.find({
      relations: ['corretor'],
      order: { created_at: 'DESC' }
    });
  }

  findOne(id: number) {
    return this.clienteRepository.findOne({
      where: { id },
      relations: ['corretor']
    });
  }

  async update(id: number, updateClienteDto: UpdateClienteDto) {
    const clienteAntigo = await this.findOne(id);
    const result = await this.clienteRepository.update(id, updateClienteDto);
    
    // Se o status mudou para "Contrato fechado" e antes não era
    if (
      updateClienteDto.status === 'Contrato fechado' && 
      clienteAntigo && 
      clienteAntigo.status !== 'Contrato fechado'
    ) {
      try {
        const valorContrato = updateClienteDto.valor_contrato || clienteAntigo.valor_contrato || 0;
        const clienteNome = `${clienteAntigo.nome} ${clienteAntigo.sobrenome || ''}`.trim();
        
        let parceiro = null;
        let admin = null;

        if (clienteAntigo.corretor_id) {
          parceiro = await this.userService.findOne(clienteAntigo.corretor_id);
          if (parceiro && parceiro.master_id) {
            admin = await this.userService.findOne(parceiro.master_id);
          }
        }

        // Notificar o parceiro
        if (parceiro && parceiro.email) {
          await this.emailService.sendClientContractClosedNotification(
            parceiro.email,
            parceiro.name,
            clienteNome,
            valorContrato
          );
        }

        // Notificar o administrador
        if (admin && admin.email) {
          await this.emailService.sendClientContractClosedNotification(
            admin.email,
            admin.name,
            clienteNome,
            valorContrato
          );
        }
      } catch (error) {
        console.error("Erro ao enviar notificação de contrato fechado:", error);
      }
    }

    return result;
  }

  remove(id: number) {
    return this.clienteRepository.delete(id);
  }
}
