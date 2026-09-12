import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { Assinatura } from "./entities/assinatura.entity";
import { CreateAssinaturaDto } from "./dto/create-assinatura.dto";
import { UpdateAssinaturaDto } from "./dto/update-assinatura.dto";
import { User } from "../user/entities/user.entity";
import { PlanosService } from "../planos/planos.service";
import { Plano } from "../planos/entities/plano.entity";
import { isAnyAdmin } from "../auth/roles/level.util";

/** Formato aceito pela coluna DATE do MySQL. */
function paraData(valor: Date): string {
  return valor.toISOString().slice(0, 10);
}

function somarMeses(data: string, meses: number): string {
  const base = new Date(`${data}T00:00:00`);
  const alvo = new Date(base);
  alvo.setMonth(alvo.getMonth() + meses);

  // 31/01 + 1 mês vira 03/03 em JavaScript; recuar para o último dia do mês
  // mantém o vencimento dentro do mês esperado.
  if (alvo.getDate() !== base.getDate()) {
    alvo.setDate(0);
  }

  return paraData(alvo);
}

@Injectable()
export class AssinaturasService {
  constructor(
    @Inject("ASSINATURA_REPOSITORY")
    private assinaturaRepository: Repository<Assinatura>,
    @Inject("USER_REPOSITORY")
    private userRepository: Repository<User>,
    private planosService: PlanosService,
  ) {}

  /** Converte os decimais que o driver devolve como string. */
  private comNumeros(assinatura: Assinatura): Assinatura {
    if (!assinatura) return assinatura;

    return {
      ...assinatura,
      valor: Number(assinatura.valor),
      plano: assinatura.plano
        ? PlanosService.comNumeros(assinatura.plano)
        : assinatura.plano,
    };
  }

  /**
   * Parceiros que ocupam vaga no plano.
   *
   * Só contam os ativos: um cadastro recém-criado fica "Inativo" até o
   * administrador aprovar, e cobrar por ele surpreenderia quem só recebeu
   * uma inscrição pelo link público. O nível vem do banco com grafias
   * diferentes ("Parceiro", "parceiro", "Corretor"), daí a comparação em
   * minúsculas.
   */
  async contarParceirosAtivos(masterId: number): Promise<number> {
    return this.userRepository
      .createQueryBuilder("user")
      .where("user.master_id = :masterId", { masterId })
      .andWhere("LOWER(user.level) IN (:...niveis)", {
        niveis: ["parceiro", "corretor"],
      })
      .andWhere("LOWER(user.status) = :status", { status: "ativo" })
      .getCount();
  }

  /** Assinatura vigente de um usuário, ou null. */
  async assinaturaAtiva(userId: number): Promise<Assinatura | null> {
    const assinatura = await this.assinaturaRepository.findOne({
      where: { userId, status: "ativa" },
      relations: ["plano"],
      order: { id: "DESC" },
    });

    return assinatura ? this.comNumeros(assinatura) : null;
  }

  /**
   * Tudo que a tela de assinatura precisa: plano, vigência e uso do limite.
   * Devolve `assinatura: null` para quem ainda não tem plano vinculado.
   */
  async resumoDoUsuario(userId: number) {
    const assinatura = await this.assinaturaAtiva(userId);
    const parceirosAtivos = await this.contarParceirosAtivos(userId);

    if (!assinatura) {
      return {
        assinatura: null,
        plano: null,
        uso: {
          parceirosAtivos,
          limite: null,
          disponivel: null,
          percentual: null,
        },
        vencida: false,
        dias_restantes: null,
      };
    }

    const limite = assinatura.plano?.limiteParceiros ?? null;
    const hoje = new Date(`${paraData(new Date())}T00:00:00`);
    const vencimento = assinatura.expiraEm
      ? new Date(`${assinatura.expiraEm}T00:00:00`)
      : null;

    const diasRestantes = vencimento
      ? Math.round((vencimento.getTime() - hoje.getTime()) / 86400000)
      : null;

    return {
      assinatura,
      plano: assinatura.plano ?? null,
      uso: {
        parceirosAtivos,
        limite,
        disponivel: limite === null ? null : Math.max(0, limite - parceirosAtivos),
        percentual:
          limite === null || limite === 0
            ? null
            : Math.round((parceirosAtivos / limite) * 100),
      },
      vencida: diasRestantes !== null && diasRestantes < 0,
      dias_restantes: diasRestantes,
    };
  }

  /**
   * Lista para o FullAdmin: todo administrador aparece, com ou sem plano,
   * para que ninguém fique esquecido sem assinatura.
   */
  async listarAssinaturasPorAdministrador() {
    const usuarios = await this.userRepository
      .createQueryBuilder("user")
      .where("LOWER(user.level) IN (:...niveis)", {
        niveis: ["administrador", "admin"],
      })
      .orderBy("user.name", "ASC")
      .getMany();

    return Promise.all(
      usuarios.map(async (usuario) => {
        const resumo = await this.resumoDoUsuario(usuario.id);

        return {
          usuario: {
            id: usuario.id,
            name: usuario.name,
            sobrenome: usuario.sobrenome,
            email: usuario.email,
            level: usuario.level,
            status: usuario.status,
          },
          ...resumo,
        };
      }),
    );
  }

  /** Histórico completo de um usuário, mais recente primeiro. */
  async historicoDoUsuario(userId: number): Promise<Assinatura[]> {
    const assinaturas = await this.assinaturaRepository.find({
      where: { userId },
      relations: ["plano"],
      order: { id: "DESC" },
    });

    return assinaturas.map((assinatura) => this.comNumeros(assinatura));
  }

  /**
   * Vincula um plano a um administrador.
   * Trocar de plano cancela a assinatura anterior, preservando o histórico.
   */
  async vincular(dto: CreateAssinaturaDto): Promise<Assinatura> {
    const usuario = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!usuario) {
      throw new NotFoundException("Usuário não encontrado");
    }

    // O plano limita quantos parceiros a empresa comporta, então ele
    // pertence a quem tem empresa: administrador ou FullAdmin.
    if (!isAnyAdmin(usuario.level)) {
      throw new BadRequestException(
        "Somente contas de administrador podem ter plano vinculado.",
      );
    }

    const plano = await this.planosService.findOne(dto.planoId);
    const ciclo = dto.ciclo || "mensal";
    const inicio = dto.inicio ? dto.inicio.slice(0, 10) : paraData(new Date());
    const expiraEm =
      dto.expiraEm?.slice(0, 10) ??
      somarMeses(inicio, ciclo === "anual" ? 12 : 1);

    if (expiraEm && expiraEm < inicio) {
      throw new BadRequestException(
        "O vencimento não pode ser anterior ao início da vigência.",
      );
    }

    const valor =
      dto.valor ?? (ciclo === "anual" ? plano.precoAnual : plano.precoMensal);

    await this.cancelarAtivasDoUsuario(usuario.id);

    const assinatura = await this.assinaturaRepository.save(
      this.assinaturaRepository.create({
        userId: usuario.id,
        planoId: plano.id,
        ciclo,
        status: "ativa",
        valor,
        inicio,
        expiraEm,
        observacao: dto.observacao ?? null,
      }),
    );

    await this.sincronizarUsuario(usuario.id, plano.id, expiraEm);

    return this.findOne(assinatura.id);
  }

  async findOne(id: number): Promise<Assinatura> {
    const assinatura = await this.assinaturaRepository.findOne({
      where: { id },
      relations: ["plano"],
    });

    if (!assinatura) {
      throw new NotFoundException("Assinatura não encontrada");
    }

    return this.comNumeros(assinatura);
  }

  async atualizar(id: number, dto: UpdateAssinaturaDto): Promise<Assinatura> {
    const assinatura = await this.assinaturaRepository.findOne({
      where: { id },
    });

    if (!assinatura) {
      throw new NotFoundException("Assinatura não encontrada");
    }

    const dados: Partial<Assinatura> = {};

    if (dto.planoId !== undefined) {
      const plano = await this.planosService.findOne(dto.planoId);
      dados.planoId = plano.id;
    }

    if (dto.ciclo !== undefined) dados.ciclo = dto.ciclo;
    if (dto.status !== undefined) dados.status = dto.status;
    if (dto.valor !== undefined) dados.valor = dto.valor;
    if (dto.observacao !== undefined) dados.observacao = dto.observacao;
    if (dto.inicio !== undefined) dados.inicio = dto.inicio.slice(0, 10);
    if (dto.expiraEm !== undefined) {
      dados.expiraEm = dto.expiraEm ? dto.expiraEm.slice(0, 10) : null;
    }

    const inicioFinal = dados.inicio ?? assinatura.inicio;
    const expiraFinal =
      dados.expiraEm !== undefined ? dados.expiraEm : assinatura.expiraEm;

    if (expiraFinal && expiraFinal < inicioFinal) {
      throw new BadRequestException(
        "O vencimento não pode ser anterior ao início da vigência.",
      );
    }

    // Uma conta só pode ter uma assinatura ativa por vez.
    if (dados.status === "ativa" && assinatura.status !== "ativa") {
      await this.cancelarAtivasDoUsuario(assinatura.userId);
    }

    await this.assinaturaRepository.update(id, dados);

    const atualizada = await this.findOne(id);

    if (atualizada.status === "ativa") {
      await this.sincronizarUsuario(
        atualizada.userId,
        atualizada.planoId,
        atualizada.expiraEm,
      );
    } else {
      await this.limparUsuario(atualizada.userId);
    }

    return atualizada;
  }

  async cancelar(id: number): Promise<Assinatura> {
    const assinatura = await this.assinaturaRepository.findOne({
      where: { id },
    });

    if (!assinatura) {
      throw new NotFoundException("Assinatura não encontrada");
    }

    await this.assinaturaRepository.update(id, { status: "cancelada" });
    await this.limparUsuario(assinatura.userId);

    return this.findOne(id);
  }

  /**
   * Barra a ativação de um parceiro acima do teto do plano.
   *
   * Empresa sem assinatura continua sem limite: aplicar um teto a quem
   * nunca contratou plano derrubaria operações que já existem.
   */
  async assertPodeAtivarParceiro(masterId: number): Promise<void> {
    if (!masterId) return;

    const assinatura = await this.assinaturaAtiva(masterId);
    const limite = assinatura?.plano?.limiteParceiros ?? null;

    if (limite === null) return;

    const ativos = await this.contarParceirosAtivos(masterId);

    if (ativos >= limite) {
      throw new ForbiddenException(
        `O plano ${assinatura.plano.nome} permite ${limite} parceiro(s) ativo(s) e o limite já foi atingido. Faça upgrade do plano para ativar mais parceiros.`,
      );
    }
  }

  private async cancelarAtivasDoUsuario(userId: number): Promise<void> {
    await this.assinaturaRepository.update(
      { userId, status: "ativa" },
      { status: "cancelada" },
    );
  }

  /**
   * Mantém `users.plano_id` e `users.plano_expired` alinhados à assinatura.
   * As colunas existem desde antes deste módulo e continuam sendo a fonte
   * rápida de consulta em telas antigas.
   */
  private async sincronizarUsuario(
    userId: number,
    planoId: number,
    expiraEm: string | null,
  ): Promise<void> {
    await this.userRepository.update(userId, {
      plano_id: planoId,
      plano_expired: expiraEm,
    });
  }

  private async limparUsuario(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      plano_id: 0,
      plano_expired: null,
    });
  }
}
