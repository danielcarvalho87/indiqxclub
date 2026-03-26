import { Injectable, Inject } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateBonificacaoDto } from './dto/create-bonificacao.dto';
import { UpdateBonificacaoDto } from './dto/update-bonificacao.dto';
import { Bonificacao } from './entities/bonificacao.entity';

@Injectable()
export class BonificacoesService {
  constructor(
    @Inject('BONIFICACAO_REPOSITORY')
    private bonificacaoRepository: Repository<Bonificacao>,
  ) {}

  create(createBonificacaoDto: CreateBonificacaoDto) {
    const bonificacao = this.bonificacaoRepository.create(createBonificacaoDto);
    return this.bonificacaoRepository.save(bonificacao);
  }

  findAll() {
    return this.bonificacaoRepository.find();
  }

  findOne(id: number) {
    return this.bonificacaoRepository.findOneBy({ id });
  }

  async update(id: number, updateBonificacaoDto: UpdateBonificacaoDto) {
    await this.bonificacaoRepository.update(id, updateBonificacaoDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.bonificacaoRepository.delete(id);
  }
}
