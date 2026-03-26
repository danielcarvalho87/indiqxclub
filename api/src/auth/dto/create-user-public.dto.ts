import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsNumber,
} from "class-validator";

export class CreateUserPublicDto {
  @IsNotEmpty({ message: "Nome é obrigatório" })
  name: string;

  @IsOptional()
  sobrenome?: string;

  @IsEmail({}, { message: "E-mail inválido" })
  @IsNotEmpty({ message: "E-mail é obrigatório" })
  email: string;

  @IsNotEmpty({ message: "Senha é obrigatória" })
  @MinLength(6, { message: "Senha deve ter no mínimo 6 caracteres" })
  password: string;

  @IsOptional()
  cpf?: string;

  @IsOptional()
  telefone?: string;

  @IsNotEmpty({ message: "Plano é obrigatório" })
  @IsNumber({}, { message: "ID do plano deve ser um número" })
  plano_id: number;

  @IsOptional()
  level?: string;

  @IsOptional()
  status?: string;

  @IsOptional()
  master_id?: number;

  @IsOptional()
  nascimento?: string;

  @IsOptional()
  sexo?: string;

  @IsOptional()
  ecivil?: string;

  @IsOptional()
  especialidade?: string;

  @IsOptional()
  nconselho?: string;
}
