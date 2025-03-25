import { BaseService } from '@modules/base/base.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ErrorTypes, Exception, throwException } from '@utils/exceptions';
import { EntityManager, Repository } from 'typeorm';
import { AuthConfig, CredentialsConfig } from './auth-config.entity';

export class AuthConfigService extends BaseService<AuthConfig> {
    constructor(@InjectRepository(AuthConfig) repository: Repository<AuthConfig>) {
        super(repository, 'auth_config');
    }

    findByUserIdAndProvider(userId: string, provider: string): Promise<AuthConfig> {
        return this.runTransaction(async (manager: EntityManager) => {
            const txRepo = manager.withRepository(this.repository);

            let config: AuthConfig;
            try {
                config = await txRepo.findOne({
                    where: {
                        provider,
                        userId,
                    },
                });
            } catch (err) {
                throwException(err);
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

            let config: AuthConfig;
            try {
                config = await txRepo.findOne({
                    where: {
                        provider,
                        user: {
                            email,
                        },
                    },
                    relations: {
                        user: true,
                    },
                });
            } catch (err) {
                throwException(err);
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
            let config: AuthConfig;
            try {
                config = await txService.findByUserIdAndProvider(userId, provider);
            } catch (err) {
                if (!(err instanceof Exception && err.type === ErrorTypes.ENTITY_NOT_FOUND)) {
                    throwException(err);
                }
                config = null;
            }

            if (config) {
                return txService.update(config.id, { config: credConfig });
            }

            return txService.create({ userId, provider, config: credConfig });
        });
    }
}
