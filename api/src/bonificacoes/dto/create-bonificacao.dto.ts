import { IsString, IsNotEmpty, IsInt, IsOptional, IsNumber } from 'class-validator';

export class CreateBonificacaoDto {
  @IsOptional()
  @IsNumber()
  master_id?: number;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsString()
  @IsNotEmpty()
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsInt()
  @IsNotEmpty()
  pontuacao: number;

  @IsString()
  @IsNotEmpty()
  status: string;
}
