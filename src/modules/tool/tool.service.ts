import { Injectable, Logger } from '@nestjs/common';
import { Transactional } from '@utils/transaction';
import { Tool } from './tool.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IntegrationService } from '@modules/integration/integration.service';
import { CreateTool } from './types/create-tool';
import { throwException, ErrorTypes } from '@utils/exceptions';
import { tryCatch } from '@utils/try-catch';
import { UpdateTool } from './types/update-tool';

@Injectable()
export class ToolService extends Transactional {
    protected readonly logger: Logger;
    constructor(
        @InjectRepository(Tool)
        private repository: Repository<Tool>,
        private integrationService: IntegrationService,
    ) {
        super(repository.manager);
        this.logger = new Logger(this.constructor.name);
    }

    async create(request: CreateTool): Promise<Tool> {
        return this.runTransaction(async (manager) => {
            const txRepository = manager.withRepository(this.repository);
            const txService = this.withTransaction(manager);
            const txIntegrationService = this.integrationService.withTransaction(manager);

            const { name, description, action, userParams, workflowParams, integrationKey } =
                request;

            const integration = await txIntegrationService.retrieve(integrationKey);

            const tool = txRepository.create({
                name,
                description,
                action,
                userParams,
                workflowParams,
                integrationKey: integration.key,
            });

            await txService.isUnique(action);

            const [error, createdTool] = await tryCatch(txRepository.save(tool));
            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return createdTool;
        });
    }

    async isUnique(action: string): Promise<void> {
        const [error, tool] = await tryCatch(this.repository.findOne({ where: { action } }));
        if (error) {
            throwException(ErrorTypes.DB_ERROR, { message: error.message });
        }

        if (tool) {
            throwException(ErrorTypes.ENTITY_EXISTS, { message: 'Tool already exists' });
        }

        return;
    }

    async retrieve(action: string, integrationKey: string): Promise<Tool> {
        return this.runTransaction(async (manager) => {
            const txRepository = manager.withRepository(this.repository);

            const [error, tool] = await tryCatch(
                txRepository.findOne({
                    where: { action, integrationKey: integrationKey },
                }),
            );

            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            if (!tool) {
                throwException(ErrorTypes.ENTITY_NOT_FOUND, { message: 'Tool not found' });
            }

            return tool;
        });
    }

    async update(action: string, integrationKey: string, request: UpdateTool): Promise<Tool> {
        return this.runTransaction(async (manager) => {
            const txRepository = manager.withRepository(this.repository);
            const txService = this.withTransaction(manager);
            const txIntegrationService = this.integrationService.withTransaction(manager);

            const { name, description, userParams, workflowParams } = request;

            const tool = await txService.retrieve(action, integrationKey);

            if (name) {
                tool.name = name;
            }

            if (description) {
                tool.description = description;
            }

            if (userParams) {
                tool.userParams = userParams;
            }

            if (workflowParams) {
                tool.workflowParams = workflowParams;
            }

            const [error, updatedTool] = await tryCatch(txRepository.save(tool));
            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return updatedTool;
        });
    }

    async delete(action: string, integrationKey: string): Promise<Tool> {
        return this.runTransaction(async (manager) => {
            const txRepository = manager.withRepository(this.repository);
            const txService = this.withTransaction(manager);
            const tool = await txService.retrieve(action, integrationKey);

            const [error, deletedTool] = await tryCatch(txRepository.remove(tool));
            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return deletedTool;
        });
    }
}
