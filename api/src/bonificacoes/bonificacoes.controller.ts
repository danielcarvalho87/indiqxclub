import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BonificacoesService } from './bonificacoes.service';
import { CreateBonificacaoDto } from './dto/create-bonificacao.dto';
import { UpdateBonificacaoDto } from './dto/update-bonificacao.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('bonificacoes')
export class BonificacoesController {
  constructor(private readonly bonificacoesService: BonificacoesService) {}

  @Post()
  create(@Body() createBonificacaoDto: CreateBonificacaoDto) {
    return this.bonificacoesService.create(createBonificacaoDto);
  }

  @Get()
  findAll() {
    return this.bonificacoesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bonificacoesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBonificacaoDto: UpdateBonificacaoDto) {
    return this.bonificacoesService.update(+id, updateBonificacaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bonificacoesService.remove(+id);
  }
}
