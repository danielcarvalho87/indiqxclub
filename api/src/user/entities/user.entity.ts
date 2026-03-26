// user.entity.ts (COMPLETO ATUALIZADO)
// Entidade de usuário com campos para status online, Pessoa Jurídica, validação de e-mail e reset de senha
// Localização: src/user/entities/user.entity.ts

import { IsOptional } from "class-validator";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "master_id", default: 0 })
  master_id: number;

  @IsOptional()
  @Column({ name: "plano_id", default: 0 })
  plano_id: number;

  @Column({ nullable: true })
  plano_expired: string;

  // Dados pessoais

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  sobrenome: string;

  @Column({ length: 10, nullable: true })
  nascimento: string;

  @Column({ length: 15, nullable: true })
  cpf: string;

  @Column({ length: 15, nullable: true })
  sexo: string;

  @Column({ length: 15, nullable: true })
  ecivil: string;

  @Column({ length: 15, nullable: true })
  telefone: string;

  @Column({ nullable: true })
  especialidade: string;

  @Column({ nullable: true })
  nconselho: string;

  // Dados de acesso

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 20 })
  level: string;

  @Column({ length: 20 })
  status: string;

  // Foto de perfil - URL pública do Firebase
  @Column({ nullable: true })
  foto_perfil: string;

  // Caminho do arquivo no Firebase Storage
  @Column({ nullable: true })
  foto_perfil_firebase_path: string;

  // ============================================
  // CAMPOS - Status Online e Último Login
  // ============================================

  @Column({ default: false })
  is_online: boolean;

  @Column({ type: "timestamp", nullable: true })
  last_login: Date;

  @Column({ type: "timestamp", nullable: true })
  last_activity: Date;

  // ============================================
  // CAMPOS - Pessoa Jurídica
  // ============================================

  @Column({
    type: "enum",
    enum: ["fisica", "juridica"],
    default: "fisica",
  })
  tipo_pessoa: "fisica" | "juridica";

  @Column({ length: 255, nullable: true })
  razao_social: string;

  @Column({ length: 18, nullable: true, unique: true })
  cnpj: string;

  // ============================================
  // CAMPOS - Validação de E-mail
  // ============================================

  @Column({ default: false })
  email_verified: boolean;

  @Column({ length: 255, nullable: true })
  email_verification_token: string;

  @Column({ type: "timestamp", nullable: true })
  email_verification_expires: Date;

  // ============================================
  // CAMPOS - Reset de Senha (NOVOS)
  // ============================================

  @Column({
    name: "reset_password_token",
    type: "varchar",
    length: 255,
    nullable: true,
  })
  resetPasswordToken: string | null;

  @Column({ name: "reset_password_expires", type: "timestamp", nullable: true })
  resetPasswordExpires: Date | null;

  // ==================LOCALIZACAO ===============

  @Column({ length: 20 })
  cep: string;

  @Column({ length: 255 })
  logradouro: string;

  @Column({ length: 255 })
  bairro: string;

  @Column({ length: 255 })
  complemento: string;

  @Column()
  numero: string;

  @Column({ length: 255 })
  localidade: string;

  @Column({ length: 2 })
  uf: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
