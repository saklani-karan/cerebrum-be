import { BaseEntity } from '@modules/base/base.entity';
import { UserWorkspace } from '@modules/user-workspace/user-workspace.entity';
import { User } from '@modules/user/user.entity';
import { Workspace } from '@modules/workspace/workspace.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'assistant' })
export class Assistant extends BaseEntity {
    identifier: string = 'assistant';

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ name: 'user_id' })
    userId: string;

    @ManyToOne(() => Workspace)
    @JoinColumn({ name: 'workspace_id' })
    workspace: Workspace;

    @Column({ name: 'workspace_id' })
    workspaceId: string;

    @Column({ name: 'name' })
    name: string;

    @Column({ name: 'description' })
    description: string;
}
