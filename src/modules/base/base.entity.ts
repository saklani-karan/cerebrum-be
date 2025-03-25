import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ulid } from 'ulid';

export class BaseEntity {
  identifier: string;

  @PrimaryColumn()
  id: string;

  @BeforeInsert()
  generateId() {
    this.id = `${this.identifier}_${ulid()}`;
  }

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ nullable: true, type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ nullable: true, type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}
