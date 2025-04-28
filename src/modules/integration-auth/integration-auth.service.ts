import { BaseService } from '@modules/base/base.service';
import { IntegrationAuth } from './integration-auth.entity';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IntegrationFactory } from '@modules/integration-library/integration-tool.factory';
import { tryCatch } from '@utils/try-catch';
import { ErrorTypes, throwException } from '@utils/exceptions';

@Injectable({ scope: Scope.REQUEST })
export class IntegrationAuthService extends BaseService<IntegrationAuth> {
    constructor(
        @InjectRepository(IntegrationAuth)
        integrationAuthRepository: Repository<IntegrationAuth>,
    ) {
        super(integrationAuthRepository);
    }

    async findByIntegrationKeyAndUserId(
        integrationKey: string,
        userId: string,
    ): Promise<IntegrationAuth> {
        return this.runTransaction(async (manager) => {
            const txIntegrationAuthRepository = manager.withRepository(this.repository);

            const [error, integrationAuth] = await tryCatch(
                txIntegrationAuthRepository.findOne({
                    where: {
                        integrationKey,
                        userId,
                    },
                }),
            );

            if (error) {
                throwException(ErrorTypes.DB_ERROR, {
                    message: error.message,
                });
            }

            if (!integrationAuth) {
                throwException(ErrorTypes.ENTITY_NOT_FOUND, {
                    message: 'Integration auth not found',
                });
            }

            return integrationAuth;
        });
    }
}
