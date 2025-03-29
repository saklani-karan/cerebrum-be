import { Entity, ManyToOne, JoinColumn, PrimaryColumn, Column, Index } from 'typeorm';
import { User } from '@modules/user/user.entity';
import { Workspace } from '@modules/workspace/workspace.entity';

@Entity('user_workspace')
export class UserWorkspace {
    @ManyToOne(() => User, (user) => user.id)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @PrimaryColumn('varchar', { name: 'user_id' })
    @Index()
    userId: string;

    @ManyToOne(() => Workspace, (workspace) => workspace.id)
    @JoinColumn({ name: 'workspace_id' })
    workspace: Workspace;

    @PrimaryColumn('varchar', { name: 'workspace_id' })
    @Index()
    workspaceId: string;
}
