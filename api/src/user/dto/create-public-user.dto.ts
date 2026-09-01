// create-public-user.dto.ts
// DTO do cadastro público de parceiros
// Localização: src/user/dto/create-public-user.dto.ts
//
// Não expõe level, status, email_verified nem tokens: esses campos são
// definidos pelo servidor. Aceitá-los aqui permitiria que qualquer visitante
// se cadastrasse como administrador.

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class CreatePublicUserDto {
  // Empresa (master) que originou o link de cadastro
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value ? parseInt(value, 10) : 0))
  master_id?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value ? parseInt(value, 10) : 0))
  plano_id?: number;

  // Dados pessoais
  @IsString()
  @IsNotEmpty({ message: "Nome é obrigatório" })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  sobrenome?: string;

  @IsString()
  @IsOptional()
  nascimento?: string;

  @IsString()
  @IsOptional()
  cpf?: string;

  @IsString()
  @IsOptional()
  sexo?: string;

  @IsString()
  @IsOptional()
  ecivil?: string;

  @IsString()
  @IsOptional()
  telefone?: string;

  @IsString()
  @IsOptional()
  especialidade?: string;

  @IsString()
  @IsOptional()
  nconselho?: string;

  // Dados de acesso
  @IsEmail({}, { message: "E-mail inválido" })
  @IsNotEmpty({ message: "E-mail é obrigatório" })
  email: string;

  @IsString()
  @IsNotEmpty({ message: "Senha é obrigatória" })
  @MinLength(8, { message: "A senha deve ter no mínimo 8 caracteres" })
  @MaxLength(72, { message: "A senha deve ter no máximo 72 caracteres" })
  password: string;

  // Pessoa Jurídica
  @IsEnum(["fisica", "juridica"])
  @IsOptional()
  tipo_pessoa?: "fisica" | "juridica";

  @ValidateIf((o) => o.tipo_pessoa === "juridica")
  @IsString()
  razao_social?: string;

  @ValidateIf((o) => o.tipo_pessoa === "juridica")
  @IsString()
  cnpj?: string;

  // Endereço
  @IsString()
  @IsOptional()
  cep?: string;

  @IsString()
  @IsOptional()
  logradouro?: string;

  @IsString()
  @IsOptional()
  bairro?: string;

  @IsString()
  @IsOptional()
  complemento?: string;

  @IsString()
  @IsOptional()
  numero?: string;

  @IsString()
  @IsOptional()
  localidade?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2)
  uf?: string;
}
