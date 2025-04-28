import { BaseService } from '@modules/base/base.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorTypes, Exception, throwException } from '@utils/exceptions';
import { EntityManager, Repository } from 'typeorm';
import { AuthConfig, CredentialsConfig } from './auth-config.entity';
import { tryCatch } from '@utils/try-catch';

export class AuthConfigService extends BaseService<AuthConfig> {
    constructor(@InjectRepository(AuthConfig) repository: Repository<AuthConfig>) {
        super(repository);
    }

    findByUserIdAndProvider(userId: string, provider: string): Promise<AuthConfig> {
        return this.runTransaction(async (manager: EntityManager) => {
            const txRepo = manager.withRepository(this.repository);

            const [error, config] = await tryCatch(
                txRepo.findOne({
                    where: {
                        provider,
                        userId,
                    },
                }),
            );

            if (error) {
                throwException(error);
            }

            if (!config) {
                throwException(ErrorTypes.ENTITY_NOT_FOUND, {
                    message: 'config not found',
                });
            }

            return config;
        });
    }

    findByEmailAndProvider(email: string, provider: string): Promise<AuthConfig> {
        return this.runTransaction(async (manager: EntityManager) => {
            const txRepo = this.withTransaction(manager);

            const [error, config] = await tryCatch(
                txRepo.findOne({
                    where: {
                        provider,
                        user: {
                            email,
                        },
                    },
                    relations: {
                        user: true,
                    },
                }),
            );

            if (error) {
                throwException(error);
            }

            if (!config) {
                throwException(ErrorTypes.ENTITY_NOT_FOUND, {
                    message: 'config not found',
                });
            }

            return config;
        });
    }

    upsertByUserId(
        userId: string,
        provider: string,
        credConfig: CredentialsConfig,
    ): Promise<AuthConfig> {
        return this.runTransaction(async (manager: EntityManager) => {
            const txService = this.withTransaction(manager);

            const [error, config] = await tryCatch(
                txService.findByUserIdAndProvider(userId, provider),
            );

            if (error) {
                if (!(error instanceof Exception && error.type === ErrorTypes.ENTITY_NOT_FOUND)) {
                    throwException(error);
                }
            }

            if (config) {
                return txService.update(config.id, { config: credConfig });
            }

            return txService.create({ userId, provider, config: credConfig });
        });
    }
}
