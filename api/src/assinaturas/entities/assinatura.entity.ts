import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Plano } from "../../planos/entities/plano.entity";

export type CicloAssinatura = "mensal" | "anual";
export type StatusAssinatura = "ativa" | "cancelada" | "expirada";

/**
 * Vínculo entre um administrador e um plano.
 *
 * O histórico é preservado: trocar de plano cancela a assinatura anterior e
 * cria uma nova, em vez de sobrescrever a linha.
 */
@Entity("assinaturas")
export class Assinatura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ name: "plano_id" })
  planoId: number;

  @ManyToOne(() => Plano)
  @JoinColumn({ name: "plano_id" })
  plano: Plano;

  @Column({ type: "varchar", length: 10, default: "mensal" })
  ciclo: CicloAssinatura;

  @Column({ type: "varchar", length: 12, default: "ativa" })
  status: StatusAssinatura;

  /** Valor cobrado no fechamento; não acompanha mudanças de preço do plano. */
  @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
  valor: number;

  @Column({ type: "date" })
  inicio: string;

  /** `null` em assinaturas sem vencimento (cortesia, Enterprise negociado). */
  @Column({ name: "expira_em", type: "date", nullable: true })
  expiraEm: string | null;

  @Column({ length: 255, nullable: true })
  observacao: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
