import { Injectable, Logger } from '@nestjs/common';
import { Transactional } from '@utils/transaction';
import { Tool } from './tool.entity';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IntegrationService } from '@modules/integration/integration.service';
import { CreateTool } from './types/create-tool';
import { throwException, ErrorTypes } from '@utils/exceptions';
import { tryCatch } from '@utils/try-catch';
import { UpdateTool } from './types/update-tool';
import { UpdateManyToolsRequest } from './types/update-many-tools';
import { integrationToolSerializerDeserializer } from '@utils/serializers/integration-tool';
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

            const { name, description, action, params, integrationKey } = request;

            const integration = await txIntegrationService.retrieve(integrationKey);

            const tool = txRepository.create({
                name,
                description,
                action,
                params: params,
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

            const { name, description, params } = request;

            const tool = await txService.retrieve(action, integrationKey);

            if (name) {
                tool.name = name;
            }

            if (description) {
                tool.description = description;
            }

            if (params) {
                tool.params = params;
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

    async findAllByKeyAndAction(key: string[], action: string[]): Promise<Tool[]> {
        return this.runTransaction(async (manager) => {
            this.logger.log(
                `findAllByKeyAction: searching for key ${JSON.stringify(key)} and action ${JSON.stringify(action)}`,
            );
            const txRepository = manager.withRepository(this.repository);

            const [error, tools] = await tryCatch(
                txRepository.find({ where: { action: In(action), integrationKey: In(key) } }),
            );

            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return tools;
        });
    }

    async createMany(request: CreateTool[]): Promise<Tool[]> {
        return this.runTransaction(async (manager) => {
            const txRepository = manager.withRepository(this.repository);
            const txService = this.withTransaction(manager);

            const tools = await txService.findAllByKeyAndAction(
                request.map((tool) => tool.integrationKey),
                request.map((tool) => tool.action),
            );

            const toCreate = request.filter(
                (tool) =>
                    !tools.some(
                        (t) => t.action === tool.action && t.integrationKey === tool.integrationKey,
                    ),
            );

            const [error, createdTools] = await tryCatch(txRepository.save(toCreate));
            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return [...createdTools, ...tools];
        });
    }

    async updateMany(request: UpdateManyToolsRequest): Promise<Tool[]> {
        return this.runTransaction(async (manager) => {
            this.logger.log('updateMany: received request');
            this.logger.debug(`updateMany: request received ${JSON.stringify(request)}`);

            const txRepository = manager.withRepository(this.repository);
            const txService = this.withTransaction(manager);

            const deserializedToolKeys = Object.keys(request).map((value) => {
                return integrationToolSerializerDeserializer.deserialize(value);
            });

            const tools = await txService.findAllByKeyAndAction(
                deserializedToolKeys.map(
                    (deserializedToolKey) => deserializedToolKey.integrationKey,
                ),
                deserializedToolKeys.map((deserializedToolKey) => deserializedToolKey.action),
            );
            this.logger.log(`updateMany: found ${tools.length} tools`);

            for (const tool of tools) {
                const searchKey = integrationToolSerializerDeserializer.serialize({
                    integrationKey: tool.integrationKey,
                    action: tool.action,
                });
                const update = request[searchKey];
                this.logger.debug(
                    `updateMany: starting with tool ${tool.action} and updating ${JSON.stringify(update)}`,
                );

                if (!update) {
                    continue;
                }

                if (update.name) {
                    tool.name = update.name;
                }
                if (update.description) {
                    tool.description = update.description;
                }
                if (update.params) {
                    tool.params = update.params;
                }
            }

            const [error, updatedTools] = await tryCatch(txRepository.save(tools));
            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return updatedTools;
        });
    }
}
