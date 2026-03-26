// create-user.dto.ts (COMPLETO ATUALIZADO)
// DTO de criação de usuário com validações para Pessoa Jurídica, e-mail e reset de senha
// Localização: src/user/dto/create-user.dto.ts

import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
  IsEnum,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class CreateUserDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  master_id?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  plano_id?: number;

  @IsString()
  @IsOptional()
  plano_expired?: string;

  // Dados pessoais
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
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
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  level?: string;

  @IsString()
  @IsOptional()
  status?: string;

  // Foto de perfil
  @IsString()
  @IsOptional()
  foto_perfil?: string;

  @IsString()
  @IsOptional()
  foto_perfil_firebase_path?: string;

  // Status Online
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === "string") {
      return value === "true" || value === "1";
    }
    return Boolean(value);
  })
  is_online?: boolean;

  @IsDateString()
  @IsOptional()
  last_login?: Date;

  @IsDateString()
  @IsOptional()
  last_activity?: Date;

  // ============================================
  // CAMPOS - Pessoa Jurídica
  // ============================================

  @IsEnum(["fisica", "juridica"])
  @IsOptional()
  tipo_pessoa?: "fisica" | "juridica";

  // Razão Social - obrigatório se tipo_pessoa = 'juridica'
  @ValidateIf((o) => o.tipo_pessoa === "juridica")
  @IsString()
  razao_social?: string;

  // CNPJ - obrigatório se tipo_pessoa = 'juridica'
  @ValidateIf((o) => o.tipo_pessoa === "juridica")
  @IsString()
  cnpj?: string;

  // ============================================
  // CAMPOS - Validação de E-mail
  // ============================================

  @IsBoolean()
  @IsOptional()
  email_verified?: boolean;

  @IsString()
  @IsOptional()
  email_verification_token?: string;

  @IsDateString()
  @IsOptional()
  email_verification_expires?: Date;

  // ============================================
  // CAMPOS - Reset de Senha (NOVOS)
  // ============================================

  @IsString()
  @IsOptional()
  resetPasswordToken?: string | null;

  @IsDateString()
  @IsOptional()
  resetPasswordExpires?: Date | null;

  // ============================================
  // CAMPOS - Endereço do Usuário
  // ============================================

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
  uf?: string;
}
