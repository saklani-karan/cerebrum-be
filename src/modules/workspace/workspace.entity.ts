import { BaseEntity } from '@modules/base/base.entity';
import { User } from '@modules/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('workspace')
export class Workspace extends BaseEntity {
    @Column({ type: 'varchar' })
    name: string;

    @Column({ name: 'admin_id', type: 'varchar' })
    adminId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'admin_id' })
    admin: User;
}
