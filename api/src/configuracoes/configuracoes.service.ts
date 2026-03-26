import { Injectable, NotFoundException, Inject } from "@nestjs/common";
import { Repository } from "typeorm";
import { Configuracao } from "./entities/configuracao.entity";
import { CreateConfiguracaoDto } from "./dto/create-configuracao.dto";
import { UpdateConfiguracaoDto } from "./dto/update-configuracao.dto";

@Injectable()
export class ConfiguracoesService {
  constructor(
    @Inject("CONFIGURACAO_REPOSITORY")
    private configuracaoRepository: Repository<Configuracao>,
  ) {}

  async create(
    createConfiguracaoDto: CreateConfiguracaoDto,
  ): Promise<Configuracao> {
    const configuracao = this.configuracaoRepository.create(
      createConfiguracaoDto,
    );
    return this.configuracaoRepository.save(configuracao);
  }

  async findAll(): Promise<Configuracao[]> {
    return this.configuracaoRepository.find({
      relations: ["master"],
      order: { id: "DESC" },
    });
  }

  async findOne(id: number): Promise<Configuracao> {
    const configuracao = await this.configuracaoRepository.findOne({
      where: { id },
      relations: ["master"],
    });

    if (!configuracao) {
      throw new NotFoundException(`Configuração com ID ${id} não encontrada`);
    }

    return configuracao;
  }

  async findByMasterId(masterId: number): Promise<Configuracao[]> {
    return this.configuracaoRepository.find({
      where: { masterId },
      relations: ["master"],
      order: { id: "DESC" },
    });
  }

  async update(
    id: number,
    updateConfiguracaoDto: UpdateConfiguracaoDto,
  ): Promise<Configuracao> {
    const configuracao = await this.findOne(id);

    const updatedConfiguracao = this.configuracaoRepository.merge(
      configuracao,
      updateConfiguracaoDto,
    );

    return this.configuracaoRepository.save(updatedConfiguracao);
  }

  async remove(id: number): Promise<void> {
    const configuracao = await this.findOne(id);
    await this.configuracaoRepository.remove(configuracao);
  }
}
