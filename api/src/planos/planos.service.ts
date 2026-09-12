import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { Plano } from "./entities/plano.entity";
import { CreatePlanoDto } from "./dto/create-plano.dto";
import { UpdatePlanoDto } from "./dto/update-plano.dto";

/**
 * Catálogo de planos.
 *
 * Os valores decimais voltam do MySQL como string; a conversão acontece aqui
 * para que o front receba número em todo lugar.
 */
@Injectable()
export class PlanosService {
  constructor(
    @Inject("PLANO_REPOSITORY")
    private planoRepository: Repository<Plano>,
  ) {}

  /** Normaliza os decimais que o driver devolve como string. */
  static comNumeros(plano: Plano): Plano {
    if (!plano) return plano;

    return {
      ...plano,
      precoMensal: Number(plano.precoMensal),
      precoAnual: Number(plano.precoAnual),
      precoParceiroExtra:
        plano.precoParceiroExtra === null
          ? null
          : Number(plano.precoParceiroExtra),
      limiteParceiros:
        plano.limiteParceiros === null ? null : Number(plano.limiteParceiros),
    };
  }

  async findAll(incluirInativos = false): Promise<Plano[]> {
    const planos = await this.planoRepository.find({
      where: incluirInativos ? {} : { ativo: true },
      order: { ordem: "ASC", id: "ASC" },
    });

    return planos.map((plano) => PlanosService.comNumeros(plano));
  }

  async findOne(id: number): Promise<Plano> {
    const plano = await this.planoRepository.findOne({ where: { id } });

    if (!plano) {
      throw new NotFoundException("Plano não encontrado");
    }

    return PlanosService.comNumeros(plano);
  }

  async create(dto: CreatePlanoDto): Promise<Plano> {
    const slug = dto.slug.trim().toLowerCase();

    const existente = await this.planoRepository.findOne({ where: { slug } });
    if (existente) {
      throw new ConflictException("Já existe um plano com este identificador");
    }

    this.validarPrecos(dto);

    const plano = this.planoRepository.create({
      ...dto,
      slug,
      limiteParceiros: dto.limiteParceiros ?? null,
      precoParceiroExtra: dto.precoParceiroExtra ?? null,
      descricao: dto.descricao ?? null,
    });

    return PlanosService.comNumeros(await this.planoRepository.save(plano));
  }

  async update(id: number, dto: UpdatePlanoDto): Promise<Plano> {
    const plano = await this.planoRepository.findOne({ where: { id } });

    if (!plano) {
      throw new NotFoundException("Plano não encontrado");
    }

    if (dto.slug) {
      const slug = dto.slug.trim().toLowerCase();
      const outro = await this.planoRepository.findOne({ where: { slug } });

      if (outro && outro.id !== plano.id) {
        throw new ConflictException(
          "Já existe um plano com este identificador",
        );
      }

      dto.slug = slug;
    }

    this.validarPrecos({ ...plano, ...dto });

    await this.planoRepository.update(id, dto as Partial<Plano>);

    return this.findOne(id);
  }

  /** Remove do catálogo. Quem já assinou continua com o vínculo intacto. */
  async remove(id: number): Promise<void> {
    const plano = await this.planoRepository.findOne({ where: { id } });

    if (!plano) {
      throw new NotFoundException("Plano não encontrado");
    }

    await this.planoRepository.update(id, { ativo: false });
  }

  private validarPrecos(dados: {
    precoMensal?: number;
    precoAnual?: number;
    precoParceiroExtra?: number | null;
  }) {
    const negativo = [
      dados.precoMensal,
      dados.precoAnual,
      dados.precoParceiroExtra,
    ].some((valor) => valor !== null && valor !== undefined && Number(valor) < 0);

    if (negativo) {
      throw new BadRequestException("Valores do plano não podem ser negativos");
    }
  }
}
