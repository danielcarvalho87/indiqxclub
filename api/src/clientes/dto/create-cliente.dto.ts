import { IsNotEmpty, IsOptional, IsString, IsEmail, IsNumber } from 'class-validator';

export class CreateClienteDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  sobrenome?: string;

  @IsNotEmpty()
  @IsString()
  telefone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsNumber()
  corretor_id?: number;

  @IsNotEmpty()
  @IsString()
  tipo_servico: string;

  @IsOptional()
  @IsNumber()
  valor_contrato?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
