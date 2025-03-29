import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserWorkspace } from './user-workspace.entity';
import { Transactional } from '@utils/transaction';
import { EntityManager } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Inject, Injectable } from '@nestjs/common';
import { tryCatch } from '@utils/try-catch';
import { ErrorTypes, throwException } from '@utils/exceptions';
import { UserService } from '@modules/user/user.service';
import { WorkspaceService } from '@modules/workspace/workspace.service';
import { User } from '@modules/user/user.entity';
import { CreateWithWorkspace } from './types/create-with-workspace';
import { Workspace } from '@modules/workspace/workspace.entity';

@Injectable()
export class UserWorkspaceService extends Transactional {
    constructor(
        @InjectRepository(UserWorkspace)
        private userWorkspaceRepository: Repository<UserWorkspace>,
        @InjectEntityManager()
        manager: EntityManager,
        @Inject(REQUEST)
        private readonly request: Request,
        private readonly userService: UserService,
        private readonly workspaceService: WorkspaceService,
    ) {
        super(manager);
    }

    create(workspaceId: string | Workspace, userId?: string | User): Promise<UserWorkspace> {
        return this.runTransaction(async (transactionalEntityManager) => {
            const txRepo = transactionalEntityManager.withRepository(this.userWorkspaceRepository);
            const txUserService = this.userService.withTransaction(transactionalEntityManager);
            const txWorkspaceService = this.workspaceService.withTransaction(
                transactionalEntityManager,
            );

            let user: User, workspace: Workspace;

            if (userId) {
                if (typeof userId === 'string') {
                    user = await txUserService.get(userId);
                } else {
                    user = userId;
                }
            } else {
                user = this.resolveUserFromRequest();
            }

            if (typeof workspaceId === 'string') {
                workspace = await txWorkspaceService.get(workspaceId);
            } else {
                workspace = workspaceId;
            }

            if (!user) {
                throwException(ErrorTypes.INVALID_ARGUMENTS, { message: 'User ID is required' });
            }

            const userWorkspaceDao = txRepo.create({
                userId: user.id,
                workspaceId: workspace.id,
            });

            const [error, userWorkspace] = await tryCatch(txRepo.save(userWorkspaceDao));
            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return userWorkspace;
        });
    }

    createWithWorkspace(request: CreateWithWorkspace): Promise<UserWorkspace> {
        return this.runTransaction(async (transactionalEntityManager) => {
            const { userId, ...workspaceRequest } = request;
            const txWorkspaceService = this.workspaceService.withTransaction(
                transactionalEntityManager,
            );
            const txUserWorkspaceService = this.withTransaction(transactionalEntityManager);
            const txUserService = this.userService.withTransaction(transactionalEntityManager);

            let user: User;
            if (userId) {
                user = await txUserService.get(userId);
            } else {
                user = this.resolveUserFromRequest();
            }

            const workspace = await txWorkspaceService.create(workspaceRequest);

            const userWorkspace = await txUserWorkspaceService.create(workspace, user);

            return userWorkspace;
        });
    }

    private resolveUserFromRequest(): User {
        return this.request?.user;
    }
}
