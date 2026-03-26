import { PartialType } from '@nestjs/mapped-types';
import { CreateBonificacaoDto } from './create-bonificacao.dto';
import { IsOptional, IsNumber } from 'class-validator';

export class UpdateBonificacaoDto extends PartialType(CreateBonificacaoDto) {
  @IsOptional()
  @IsNumber()
  master_id?: number;

  @IsOptional()
  @IsNumber()
  userId?: number;
}
