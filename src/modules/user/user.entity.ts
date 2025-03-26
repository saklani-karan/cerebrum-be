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

    @Column({ name: 'name', type: 'text', nullable: true })
    name: string;

    @Column({ name: 'dp_url', type: 'varchar', nullable: true })
    dpUrl: string;
}
