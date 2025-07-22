import { BaseService } from '@modules/base/base.service';
import { Assistant } from './assistant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { CreateAssistantRequest } from './types/create-assistant';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { tryCatch } from '@utils/try-catch';
import { ErrorTypes, throwException } from '@utils/exceptions';
import { UpdateAssistantRequest } from './types/update-assistant';
import { WorkspaceService } from '@modules/workspace/workspace.service';
import { Workspace } from '@modules/workspace/workspace.entity';
import { User } from '@modules/user/user.entity';

export class AssistantService extends BaseService<Assistant> {
    constructor(
        @InjectRepository(Assistant) repository: Repository<Assistant>,
        private readonly workspaceService: WorkspaceService,
        @Inject(REQUEST) request: Request,
    ) {
        super(repository);
        this.request = request;
    }

    create(request: CreateAssistantRequest): Promise<Assistant> {
        return this.runTransaction(async (manager: EntityManager) => {
            this.logger.log('create: received request for assistant creation');
            const { description, name, workspaceId } = request;

            const txRepo = manager.withRepository(this.repository);
            const txService = this.withTransaction(manager);
            const txWorkspaceService = this.workspaceService.withTransaction(manager);

            const user: User = txService.resolveUserFromRequest();
            const workspace: Workspace = await txWorkspaceService.get(workspaceId);

            const createAssistantDao = txRepo.create({
                userId: user.id,
                description,
                name,
                workspaceId: workspace.id,
            });

            const [error, assistant] = await tryCatch(txRepo.save(createAssistantDao));

            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return assistant;
        });
    }

    update(id: string, request: UpdateAssistantRequest): Promise<Assistant> {
        return this.runTransaction(async (manager: EntityManager) => {
            this.logger.log('create: received request for assistant creation');
            const { description, name } = request;

            const txRepo = manager.withRepository(this.repository);
            const txService = this.withTransaction(manager);

            const assistant: Assistant = await txService.get(id);

            let isUpdateRequired: boolean = false;
            if (description && description != assistant.description) {
                isUpdateRequired = true;
                assistant.description = description;
            }

            if (name && name != assistant.name) {
                isUpdateRequired = true;
                assistant.name = name;
            }

            if (!isUpdateRequired) {
                return assistant;
            }

            const [error, updatedAssistant] = await tryCatch(txRepo.save(assistant));

            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return updatedAssistant;
        });
    }
}
