import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

/**
 * Catálogo de planos de assinatura.
 * Só o FullAdmin cria e edita; o administrador enxerga apenas o plano da
 * própria assinatura.
 */
@Entity("planos")
export class Plano {
  @PrimaryGeneratedColumn()
  id: number;

  /** Identificador estável usado em código e seeds ("free", "growth"...). */
  @Column({ length: 40, unique: true })
  slug: string;

  @Column({ length: 60 })
  nome: string;

  /**
   * Teto de parceiros ativos da empresa. `null` significa ilimitado
   * (plano Enterprise).
   */
  @Column({ name: "limite_parceiros", type: "int", nullable: true })
  limiteParceiros: number | null;

  @Column({
    name: "preco_mensal",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  precoMensal: number;

  @Column({
    name: "preco_anual",
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
  })
  precoAnual: number;

  /** Cobrança por parceiro acima do limite; `null` quando não se aplica. */
  @Column({
    name: "preco_parceiro_extra",
    type: "decimal",
    precision: 10,
    scale: 2,
    nullable: true,
  })
  precoParceiroExtra: number | null;

  @Column({ length: 255, nullable: true })
  descricao: string | null;

  /** Plano sugerido na tabela de preços. */
  @Column({ type: "boolean", default: false })
  destaque: boolean;

  /** Plano fora do catálogo continua valendo para quem já assinou. */
  @Column({ type: "boolean", default: true })
  ativo: boolean;

  @Column({ type: "int", default: 0 })
  ordem: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
