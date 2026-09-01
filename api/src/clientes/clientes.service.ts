import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { Cliente } from "./entities/cliente.entity";
import { CreateClienteDto } from "./dto/create-cliente.dto";
import { UpdateClienteDto } from "./dto/update-cliente.dto";
import { EmailService } from "../email/email.service";
import { UserService } from "../user/user.service";
import { UserFromJwt } from "../auth/models/UserFromJwt";
import { isAdmin, isFullAdmin } from "../auth/roles/level.util";

@Injectable()
export class ClientesService {
  constructor(
    @Inject("CLIENTE_REPOSITORY")
    private clienteRepository: Repository<Cliente>,
    private readonly emailService: EmailService,
    private readonly userService: UserService,
  ) {}

  /**
   * Resolve qual corretor pode ser vinculado a um cliente.
   * Parceiro só cadastra em nome próprio; Administrador, em nome dele ou de
   * um parceiro vinculado; FullAdmin, de qualquer um.
   */
  private async resolveCorretorId(
    corretorId: number | undefined,
    user: UserFromJwt,
  ): Promise<number> {
    if (!isFullAdmin(user.level) && !isAdmin(user.level)) {
      return user.id;
    }

    if (!corretorId || Number(corretorId) === Number(user.id)) {
      return user.id;
    }

    if (isFullAdmin(user.level)) {
      return Number(corretorId);
    }

    const corretor = await this.userService.findOneRaw(Number(corretorId));

    if (!corretor || Number(corretor.master_id) !== Number(user.id)) {
      throw new ForbiddenException(
        "Você só pode vincular clientes a parceiros da sua empresa.",
      );
    }

    return Number(corretorId);
  }

  /**
   * Query base dos clientes.
   * O corretor é trazido com uma seleção explícita: carregar a relação
   * inteira devolvia o registro completo do usuário (hash de senha, tokens
   * de reset e CPF) dentro de toda listagem de clientes.
   */
  private baseQuery() {
    return this.clienteRepository
      .createQueryBuilder("cliente")
      .leftJoin("cliente.corretor", "corretor")
      .addSelect([
        "corretor.id",
        "corretor.name",
        "corretor.sobrenome",
        "corretor.master_id",
      ]);
  }

  /** Carrega o cliente garantindo que ele esteja no escopo do usuário. */
  private async findScoped(id: number, user: UserFromJwt): Promise<Cliente> {
    const cliente = await this.baseQuery()
      .where("cliente.id = :id", { id })
      .getOne();

    if (!cliente) {
      throw new NotFoundException("Cliente não encontrado");
    }

    if (isFullAdmin(user.level)) {
      return cliente;
    }

    if (Number(cliente.corretor_id) === Number(user.id)) {
      return cliente;
    }

    if (
      isAdmin(user.level) &&
      cliente.corretor &&
      Number(cliente.corretor.master_id) === Number(user.id)
    ) {
      return cliente;
    }

    throw new ForbiddenException(
      "Você não tem permissão para acessar este cliente.",
    );
  }

  async create(createClienteDto: CreateClienteDto, user: UserFromJwt) {
    const corretorId = await this.resolveCorretorId(
      createClienteDto.corretor_id,
      user,
    );

    const novoCliente = await this.clienteRepository.save({
      ...createClienteDto,
      corretor_id: corretorId,
    });

    // Enviar notificação de novo cliente indicado
    if (novoCliente.corretor_id) {
      try {
        const parceiro = await this.userService.findOneRaw(
          novoCliente.corretor_id,
        );
        if (parceiro && parceiro.master_id) {
          const admin = await this.userService.findOneRaw(parceiro.master_id);
          if (admin && admin.email) {
            const clienteNome =
              `${novoCliente.nome} ${novoCliente.sobrenome || ""}`.trim();
            const parceiroNome =
              `${parceiro.name} ${parceiro.sobrenome || ""}`.trim();
            await this.emailService.sendNewClientIndicatedNotification(
              admin.email,
              admin.name,
              clienteNome,
              parceiroNome,
            );
          }
        }
      } catch (error) {
        console.error("Erro ao enviar notificação de novo cliente:", error);
      }
    }

    return novoCliente;
  }

  async findAll(user: UserFromJwt) {
    if (isFullAdmin(user.level)) {
      return this.baseQuery().orderBy("cliente.created_at", "DESC").getMany();
    }

    if (isAdmin(user.level)) {
      return this.baseQuery()
        .where("corretor.master_id = :userId", { userId: user.id })
        .orWhere("cliente.corretor_id = :userId", { userId: user.id })
        .orderBy("cliente.created_at", "DESC")
        .getMany();
    }

    return this.baseQuery()
      .where("cliente.corretor_id = :userId", { userId: user.id })
      .orderBy("cliente.created_at", "DESC")
      .getMany();
  }

  async findOne(id: number, user: UserFromJwt) {
    return this.findScoped(id, user);
  }

  async update(
    id: number,
    updateClienteDto: UpdateClienteDto,
    user: UserFromJwt,
  ) {
    const clienteAntigo = await this.findScoped(id, user);

    const data: UpdateClienteDto = { ...updateClienteDto };

    // Reatribuir o cliente a outro corretor exige permissão sobre o destino.
    if (
      data.corretor_id !== undefined &&
      Number(data.corretor_id) !== Number(clienteAntigo.corretor_id)
    ) {
      data.corretor_id = await this.resolveCorretorId(data.corretor_id, user);
    }

    const result = await this.clienteRepository.update(id, data);

    // Se o status mudou para "Contrato fechado" e antes não era
    if (
      data.status === "Contrato fechado" &&
      clienteAntigo.status !== "Contrato fechado"
    ) {
      try {
        const valorContrato =
          data.valor_contrato || clienteAntigo.valor_contrato || 0;
        const clienteNome =
          `${clienteAntigo.nome} ${clienteAntigo.sobrenome || ""}`.trim();

        let parceiro = null;
        let admin = null;

        if (clienteAntigo.corretor_id) {
          parceiro = await this.userService.findOneRaw(
            clienteAntigo.corretor_id,
          );
          if (parceiro && parceiro.master_id) {
            admin = await this.userService.findOneRaw(parceiro.master_id);
          }
        }

        // Notificar o parceiro
        if (parceiro && parceiro.email) {
          await this.emailService.sendClientContractClosedNotification(
            parceiro.email,
            parceiro.name,
            clienteNome,
            valorContrato,
          );
        }

        // Notificar o administrador
        if (admin && admin.email) {
          await this.emailService.sendClientContractClosedNotification(
            admin.email,
            admin.name,
            clienteNome,
            valorContrato,
          );
        }
      } catch (error) {
        console.error("Erro ao enviar notificação de contrato fechado:", error);
      }
    }

    return result;
  }

  async remove(id: number, user: UserFromJwt) {
    await this.findScoped(id, user);
    return this.clienteRepository.delete(id);
  }
}
