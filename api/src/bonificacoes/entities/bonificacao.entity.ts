import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('bonificacoes')
export class Bonificacao {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  master_id: number;

  @Column({ nullable: true })
  userId: number;

  @Column()
  titulo: string;

  @Column()
  descricao: string;

  @Column('int')
  pontuacao: number;

  @Column()
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
