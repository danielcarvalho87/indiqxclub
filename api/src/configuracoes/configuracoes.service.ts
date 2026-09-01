import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { Configuracao } from "./entities/configuracao.entity";
import { CreateConfiguracaoDto } from "./dto/create-configuracao.dto";
import { UpdateConfiguracaoDto } from "./dto/update-configuracao.dto";
import { UserFromJwt } from "../auth/models/UserFromJwt";
import { isFullAdmin, isParceiro } from "../auth/roles/level.util";

@Injectable()
export class ConfiguracoesService {
  constructor(
    @Inject("CONFIGURACAO_REPOSITORY")
    private configuracaoRepository: Repository<Configuracao>,
  ) {}

  /**
   * A relação "master" carregava o registro completo do usuário — incluindo
   * o hash de senha e os tokens de reset — em toda resposta de configuração.
   * Nada no app consome esse objeto, então ele não é mais carregado.
   */

  /** Empresa (master) à qual o usuário pertence. */
  private masterScope(user: UserFromJwt): number {
    return isParceiro(user.level) ? Number(user.master_id) : Number(user.id);
  }

  private assertScope(masterId: number, user: UserFromJwt): void {
    if (isFullAdmin(user.level)) return;

    if (Number(masterId) !== this.masterScope(user)) {
      throw new ForbiddenException(
        "Você não tem permissão para acessar estas configurações.",
      );
    }
  }

  async create(
    createConfiguracaoDto: CreateConfiguracaoDto,
    user: UserFromJwt,
  ): Promise<Configuracao> {
    // O vínculo com a empresa vem do token, não do corpo da requisição.
    const masterId = isFullAdmin(user.level)
      ? createConfiguracaoDto.masterId || user.id
      : user.id;

    const configuracao = this.configuracaoRepository.create({
      ...createConfiguracaoDto,
      masterId,
    });

    return this.configuracaoRepository.save(configuracao);
  }

  async findAll(): Promise<Configuracao[]> {
    return this.configuracaoRepository.find({
      order: { id: "DESC" },
    });
  }

  async findOne(id: number, user?: UserFromJwt): Promise<Configuracao> {
    const configuracao = await this.configuracaoRepository.findOne({
      where: { id },
    });

    if (!configuracao) {
      throw new NotFoundException(`Configuração com ID ${id} não encontrada`);
    }

    if (user) {
      this.assertScope(configuracao.masterId, user);
    }

    return configuracao;
  }

  async findByMasterId(masterId: number): Promise<Configuracao[]> {
    return this.configuracaoRepository.find({
      where: { masterId },
      order: { id: "DESC" },
    });
  }

  /** Dados de exibição usados na tela pública de cadastro de parceiros. */
  async findPublicByMasterId(
    masterId: number,
  ): Promise<{ id: number; masterId: number; nomeEmpresa: string }[]> {
    const configuracoes = await this.configuracaoRepository.find({
      where: { masterId },
      select: ["id", "masterId", "nomeEmpresa"],
      order: { id: "DESC" },
    });

    return configuracoes.map((config) => ({
      id: config.id,
      masterId: config.masterId,
      nomeEmpresa: config.nomeEmpresa,
    }));
  }

  async update(
    id: number,
    updateConfiguracaoDto: UpdateConfiguracaoDto,
    user: UserFromJwt,
  ): Promise<Configuracao> {
    const configuracao = await this.findOne(id, user);

    const data = { ...updateConfiguracaoDto };
    // Não permite transferir a configuração para outra empresa.
    delete data.masterId;

    const updatedConfiguracao = this.configuracaoRepository.merge(
      configuracao,
      data,
    );

    return this.configuracaoRepository.save(updatedConfiguracao);
  }

  async remove(id: number, user: UserFromJwt): Promise<void> {
    const configuracao = await this.findOne(id, user);
    await this.configuracaoRepository.remove(configuracao);
  }
}
