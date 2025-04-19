import { InjectRepository } from '@nestjs/typeorm';
import { Integration } from './integration.entity';
import { Repository } from 'typeorm';
import { Transactional } from '@utils/transaction';
import { CreateIntegration } from './types/create-integration';
import { UpdateIntegration } from './types/update-integration';
import { throwException, ErrorTypes } from '@utils/exceptions';
import { Injectable, Logger } from '@nestjs/common';
import { tryCatch } from '@utils/try-catch';

@Injectable()
export class IntegrationService extends Transactional {
    protected readonly logger: Logger;
    constructor(
        @InjectRepository(Integration)
        private repository: Repository<Integration>,
    ) {
        super(repository.manager);
        this.logger = new Logger(this.constructor.name);
    }

    async retrieve(key: string) {
        return this.runTransaction(async (manager) => {
            const txRepository = manager.withRepository(this.repository);

            const [error, integration] = await tryCatch(txRepository.findOne({ where: { key } }));
            if (error) {
                throwException(ErrorTypes.ENTITY_NOT_FOUND, { message: error.message });
            }
            return integration;
        });
    }

    async create(request: CreateIntegration) {
        return this.runTransaction(async (manager) => {
            const txRepository = manager.withRepository(this.repository);
            const txService = this.withTransaction(manager);
            const { key, name, description, iconUrl } = request;

            const integrationDao: Integration = txRepository.create({
                key,
                name,
                description,
                iconUrl,
            });

            await txService.isUnique(key);

            const [error, integration] = await tryCatch(txRepository.save(integrationDao));
            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return integration;
        });
    }

    async update(key: string, request: UpdateIntegration) {
        return this.runTransaction(async (manager) => {
            const txRepository = manager.withRepository(this.repository);
            const txService = this.withTransaction(manager);

            const { name, description, iconUrl } = request;

            const integration = await txService.retrieve(key);
            if (name != integration.name) {
                integration.name = name;
            }
            if (description != integration.description) {
                integration.description = description;
            }
            if (iconUrl != integration.iconUrl) {
                integration.iconUrl = iconUrl;
            }

            const [error, updatedIntegration] = await tryCatch(txRepository.save(integration));
            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return updatedIntegration;
        });
    }

    async delete(key: string) {
        return this.runTransaction(async (manager) => {
            const txRepository = manager.withRepository(this.repository);
            const txService = this.withTransaction(manager);

            const integration = await txService.retrieve(key);

            const [error, deletedIntegration] = await tryCatch(txRepository.remove(integration));
            if (error) {
                throwException(ErrorTypes.DB_ERROR, { message: error.message });
            }

            return deletedIntegration;
        });
    }

    async isUnique(key: string): Promise<void> {
        const [error, integration] = await tryCatch(this.repository.findOne({ where: { key } }));
        if (error) {
            throwException(ErrorTypes.DB_ERROR, { message: error.message });
        }

        if (integration) {
            throwException(ErrorTypes.ENTITY_NOT_FOUND, { message: 'Integration already exists' });
        }

        return;
    }
}
