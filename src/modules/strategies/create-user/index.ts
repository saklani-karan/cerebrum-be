import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CreateUserStrategyInterface, CreateUserRequest } from './types';
import { User } from '@modules/user/user.entity';
import { Transactional } from '@utils/transaction';
import { InjectEntityManager } from '@nestjs/typeorm';
import { UserService } from '@modules/user/user.service';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import UserQueue from '@queue/user.queue';
import { tryCatch } from '@utils/try-catch';
import { throwException } from '@utils/exceptions';
import { UserWorkspaceService } from '@modules/user-workspace/user-workspace.service';
export const CREATE_USER_STRATEGY = 'create_user_strategy';

@Injectable()
export class CreateUserStrategyImpl extends Transactional implements CreateUserStrategyInterface {
    constructor(
        @InjectEntityManager() manager: EntityManager,
        private readonly userService: UserService,
        private readonly configService: ConfigService,
        private readonly userWorkspaceService: UserWorkspaceService,
        @InjectQueue(UserQueue.queue) private readonly queue: Queue,
    ) {
        super(manager);
    }

    exec(request: CreateUserRequest): Promise<User> {
        return this.runTransaction(async (manager: EntityManager) => {
            const txUserService = this.userService.withTransaction(manager);
            const txUserWorkspaceService = this.userWorkspaceService.withTransaction(manager);
            const { email, name, dpUrl } = request;
            const user = await txUserService.create({
                email,
                name,
                dpUrl,
            });

            const workspaceName = this.resolveWorkspaceName();

            const userWorkspace = await txUserWorkspaceService.createWithWorkspace({
                name: workspaceName,
                adminId: user.id,
                userId: user.id,
            });

            const [error] = await tryCatch(
                this.queue.add('user-created', {
                    user,
                    userWorkspace,
                }),
            );
            if (error) {
                throwException(error);
            }

            return user;
        });
    }

    private resolveWorkspaceName(): string {
        return this.configService.get('DEFAULT_WORKSPACE_NAME');
    }
}
