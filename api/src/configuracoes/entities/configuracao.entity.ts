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

@Entity("configuracoes")
export class Configuracao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "master_id" })
  masterId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: "master_id" })
  master: User;

  @Column({ name: "nome_empresa", length: 200 })
  nomeEmpresa: string;

  @Column({ length: 18 })
  cnpj: string;

  @Column({ name: "pontos_por_novo_usuario", type: "int" })
  pontosPorNovoUsuario: number;

  @Column({
    name: "comissao_por_venda",
    type: "decimal",
    precision: 5,
    scale: 2,
  })
  comissaoPorVenda: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
