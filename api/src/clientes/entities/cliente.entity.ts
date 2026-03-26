import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity("clientes")
export class Cliente {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 100, nullable: true })
  sobrenome: string;

  @Column({ length: 20, nullable: true })
  telefone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "corretor_id" })
  corretor: User;

  @Column({ nullable: true })
  corretor_id: number;

  @Column({ length: 50, nullable: true })
  tipo_servico: string;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  valor_contrato: number;

  @Column({ length: 20, default: "Ativo" })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
