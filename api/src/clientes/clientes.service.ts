import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Brackets, Repository, SelectQueryBuilder } from "typeorm";
import { Cliente } from "./entities/cliente.entity";
import { CreateClienteDto } from "./dto/create-cliente.dto";
import { UpdateClienteDto } from "./dto/update-cliente.dto";
import { EmailService } from "../email/email.service";
import { UserService } from "../user/user.service";
import { UserFromJwt } from "../auth/models/UserFromJwt";
import { isAdmin, isFullAdmin } from "../auth/roles/level.util";
import {
  buildPaginated,
  escapeLike,
  PaginationQueryDto,
  resolvePaging,
} from "../common/dto/pagination-query.dto";

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

  /** Aplica o recorte de visibilidade do usuário sobre a query. */
  private applyScope(qb: SelectQueryBuilder<Cliente>, user: UserFromJwt) {
    if (isFullAdmin(user.level)) {
      return qb;
    }

    if (isAdmin(user.level)) {
      return qb.andWhere(
        new Brackets((w) => {
          w.where("corretor.master_id = :scopeId", { scopeId: user.id }).orWhere(
            "cliente.corretor_id = :scopeId",
            { scopeId: user.id },
          );
        }),
      );
    }

    return qb.andWhere("cliente.corretor_id = :scopeId", { scopeId: user.id });
  }

  async findAll(user: UserFromJwt, query?: PaginationQueryDto) {
    const qb = this.applyScope(this.baseQuery(), user).orderBy(
      "cliente.created_at",
      "DESC",
    );

    const termo = query?.search?.trim();
    if (termo) {
      const padrao = `%${escapeLike(termo)}%`;
      qb.andWhere(
        new Brackets((w) => {
          w.where("cliente.nome LIKE :termo", { termo: padrao })
            .orWhere("cliente.sobrenome LIKE :termo", { termo: padrao })
            .orWhere("cliente.email LIKE :termo", { termo: padrao })
            .orWhere("cliente.telefone LIKE :termo", { termo: padrao })
            .orWhere("corretor.name LIKE :termo", { termo: padrao })
            .orWhere("corretor.sobrenome LIKE :termo", { termo: padrao });
        }),
      );
    }

    // Sem `page` a resposta continua sendo o array completo (dashboard,
    // relatórios e "meus ganhos" agregam sobre a base inteira).
    if (query?.page === undefined) {
      return qb.getMany();
    }

    const { page, limit, skip } = resolvePaging(query);
    const [data, total] = await qb.skip(skip).take(limit).getManyAndCount();

    return buildPaginated(data, total, page, limit);
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

    const virouFechado =
      data.status === "Contrato fechado" &&
      clienteAntigo.status !== "Contrato fechado";

    // A data de fechamento é do servidor. Antes os relatórios usavam
    // updated_at, que muda a cada edição do cadastro.
    if (virouFechado) {
      (data as Cliente).data_fechamento = new Date();
    } else if (
      data.status &&
      data.status !== "Contrato fechado" &&
      clienteAntigo.status === "Contrato fechado"
    ) {
      // Contrato reaberto: a data anterior deixa de valer.
      (data as Cliente).data_fechamento = null;
    }

    const result = await this.clienteRepository.update(id, data);

    if (virouFechado) {
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
