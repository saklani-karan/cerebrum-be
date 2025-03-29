import { Workspace } from '@modules/workspace/workspace.entity';
import { User } from '@modules/user/user.entity';

export type CreateUserWorkSpace = (
    | { workspaceId: string; workspace?: Workspace }
    | { workspaceId?: string; workspace: Workspace }
) &
    ({ userId: string; user?: User } | { userId?: string; user: User });
