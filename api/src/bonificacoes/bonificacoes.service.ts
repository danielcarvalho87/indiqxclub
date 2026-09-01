import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { CreateBonificacaoDto } from "./dto/create-bonificacao.dto";
import { UpdateBonificacaoDto } from "./dto/update-bonificacao.dto";
import { Bonificacao } from "./entities/bonificacao.entity";
import { UserFromJwt } from "../auth/models/UserFromJwt";
import { isFullAdmin, isParceiro } from "../auth/roles/level.util";

@Injectable()
export class BonificacoesService {
  constructor(
    @Inject("BONIFICACAO_REPOSITORY")
    private bonificacaoRepository: Repository<Bonificacao>,
  ) {}

  /**
   * Empresa (master) à qual as bonificações do usuário pertencem.
   * Para um parceiro é o master_id; para um administrador, o próprio id.
   */
  private masterScope(user: UserFromJwt): number {
    return isParceiro(user.level) ? Number(user.master_id) : Number(user.id);
  }

  /** Carrega a bonificação garantindo que ela seja da empresa do usuário. */
  private async findScoped(
    id: number,
    user: UserFromJwt,
  ): Promise<Bonificacao> {
    const bonificacao = await this.bonificacaoRepository.findOneBy({ id });

    if (!bonificacao) {
      throw new NotFoundException("Bonificação não encontrada");
    }

    if (isFullAdmin(user.level)) {
      return bonificacao;
    }

    const scope = this.masterScope(user);

    if (
      Number(bonificacao.master_id) !== scope &&
      Number(bonificacao.userId) !== scope
    ) {
      throw new ForbiddenException(
        "Você não tem permissão para acessar esta bonificação.",
      );
    }

    return bonificacao;
  }

  create(createBonificacaoDto: CreateBonificacaoDto, user: UserFromJwt) {
    // O vínculo com a empresa vem do token, não do corpo da requisição.
    const bonificacao = this.bonificacaoRepository.create({
      ...createBonificacaoDto,
      master_id: user.id,
      userId: user.id,
    });
    return this.bonificacaoRepository.save(bonificacao);
  }

  findAll(user: UserFromJwt) {
    if (isFullAdmin(user.level)) {
      return this.bonificacaoRepository.find();
    }

    const scope = this.masterScope(user);

    return this.bonificacaoRepository.find({
      where: [{ master_id: scope }, { userId: scope }],
    });
  }

  findOne(id: number, user: UserFromJwt) {
    return this.findScoped(id, user);
  }

  async update(
    id: number,
    updateBonificacaoDto: UpdateBonificacaoDto,
    user: UserFromJwt,
  ) {
    await this.findScoped(id, user);

    const data = { ...updateBonificacaoDto };
    // Não permite mover a bonificação para outra empresa.
    delete data.master_id;
    delete data.userId;

    await this.bonificacaoRepository.update(id, data);
    return this.bonificacaoRepository.findOneBy({ id });
  }

  async remove(id: number, user: UserFromJwt) {
    await this.findScoped(id, user);
    return this.bonificacaoRepository.delete(id);
  }
}
