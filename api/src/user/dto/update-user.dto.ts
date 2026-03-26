// update-user.dto.ts (COMPLETO ATUALIZADO)
// DTO de atualização de usuário com campos de reset de senha
// Localização: src/user/dto/update-user.dto.ts

import { PartialType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
} from "class-validator";
import { Type, Transform } from "class-transformer";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsNumber({}, { message: "ID deve ser um número" })
  @Type(() => Number)
  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  id?: number;

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
  @IsOptional()
  name?: string;

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
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

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
    if (value === undefined || value === null) {
      return undefined;
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

  // Pessoa Jurídica
  @IsEnum(["fisica", "juridica"])
  @IsOptional()
  tipo_pessoa?: "fisica" | "juridica";

  @IsString()
  @IsOptional()
  razao_social?: string;

  @IsString()
  @IsOptional()
  cnpj?: string;

  // Validação de E-mail
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

  // ============================================

  @IsDateString()
  @IsOptional()
  updated_at?: Date;
}
