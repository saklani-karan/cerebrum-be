import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateUserStrategyInterface, CreateUserRequest } from './types';
import { User } from '@modules/user/user.entity';
import { Transactional } from '@utils/transaction';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UserService } from '@modules/user/user.service';
import { WorkspaceService } from '@modules/workspace/workspace.service';
import { ConfigService } from '@nestjs/config';

export const CREATE_USER_STRATEGY = 'create_user_strategy';

@Injectable()
export class CreateUserStrategyImpl extends Transactional implements CreateUserStrategyInterface {
    constructor(
        @InjectEntityManager() manager: EntityManager,
        private readonly userService: UserService,
        private readonly workspaceService: WorkspaceService,
        private readonly configService: ConfigService,
    ) {
        super(manager);
    }

    exec(request: CreateUserRequest): Promise<User> {
        return this.runTransaction(async (manager: EntityManager) => {
            const txUserService = this.userService.withTransaction(manager);
            const txWorkspaceService = this.workspaceService.withTransaction(manager);
            const { email, name, dpUrl } = request;
            const user = await txUserService.create({
                email,
                name,
                dpUrl,
            });
            console.log('user', user);

            const workspaceName = this.resolveWorkspaceName();

            const workspace = await txWorkspaceService.create({
                name: workspaceName,
                adminId: user.id,
            });

            console.log('workspace', workspace);

            return user;
        });
    }

    private resolveWorkspaceName(): string {
        return this.configService.get('DEFAULT_WORKSPACE_NAME');
    }
}
