import { InjectRepository } from '@nestjs/typeorm';
import { Workspace } from './workspace.entity';
import { BaseService } from '@modules/base/base.service';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { CreateWorkspace } from './types/create-workspace';
import { ErrorTypes, throwException } from '@utils/exceptions';
import { REQUEST } from '@nestjs/core';
import { Inject } from '@nestjs/common';
import { Request } from 'express';
import { UserService } from '@modules/user/user.service';
import { User } from '@modules/user/user.entity';
import { UpdateWorkspace } from './types/update-workspace';
import { tryCatch } from '@utils/try-catch';
export class WorkspaceService extends BaseService<Workspace> {
    constructor(
        @InjectRepository(Workspace) repository: Repository<Workspace>,
        private readonly userService: UserService,
        @Inject(REQUEST) protected readonly request?: Request,
    ) {
        super(repository);
    }

    create(request: CreateWorkspace): Promise<Workspace> {
        return this.runTransaction(async (manager: EntityManager) => {
            const txRepo = manager.withRepository(this.repository);
            const txUserService = this.userService.withTransaction(manager);
            const { name, adminId } = request;

            let admin: User;
            if (adminId) {
                admin = await txUserService.get(adminId);
            } else {
                admin = this.resolveUserFromRequest();
            }

            if (!admin) {
                throwException(ErrorTypes.INVALID_ARGUMENTS, {
                    message: 'Admin not found while creating workspace',
                });
            }

            const workspaceDao = txRepo.create({
                name,
                adminId: admin.id,
            });

            const [error, workspace] = await tryCatch(txRepo.save(workspaceDao));
            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return workspace;
        });
    }

    update(id: string, request: UpdateWorkspace): Promise<Workspace> {
        return this.runTransaction(async (manager: EntityManager) => {
            const txRepo = manager.withRepository(this.repository);
            const txService = this.withTransaction(manager);
            const { name } = request;

            const workspace = await txService.get(id);

            if (name) {
                workspace.name = name;
            }

            const [error, updatedWorkspace] = await tryCatch(txRepo.save(workspace));
            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return updatedWorkspace;
        });
    }
}
