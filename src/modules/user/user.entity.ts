import { BaseEntity } from '@modules/base/base.entity';
import { BeforeInsert, Column, Entity } from 'typeorm';

@Entity({ name: 'user' })
export class User extends BaseEntity {
  identifier: string = 'user';

  @BeforeInsert()
  beforeInsert() {
    this.generateId();
    this.email = this.email.toLowerCase();
  }

  @Column({ name: 'email', type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'first_name', type: 'text', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'text', nullable: true })
  lastName: string;

  @Column({ name: 'dp_url', type: 'varchar', nullable: true })
  dpUrl: string;
}
