import { IntegrationAuthService } from '@modules/integration-auth/integration-auth.service';
import { IntegrationFactory } from '@modules/integration-library/integration-tool.factory';
import { IntegrationService } from '@modules/integration/integration.service';
import { Transactional } from '@utils/transaction';
import { HandleCallbackParams, HandleCallbackStrategy } from './types';
import { IntegrationAuth } from '@modules/integration-auth/integration-auth.entity';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { CallbackResponse } from '@modules/integration-library/types/integration';
import { tryCatch } from '@utils/try-catch';
import { ErrorTypes, Exception } from '@utils/exceptions';
import { Injectable, Logger, Scope } from '@nestjs/common';
import { Integration } from '@modules/integration/integration.entity';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.REQUEST })
export class HandleCallbackStrategyImpl extends Transactional implements HandleCallbackStrategy {
    private readonly logger: Logger;
    constructor(
        private readonly integrationAuthService: IntegrationAuthService,
        private readonly integrationService: IntegrationService,
        private readonly integrationFactory: IntegrationFactory,
        @InjectEntityManager() entityManager: EntityManager,
        private readonly configService: ConfigService,
    ) {
        super(entityManager);
        this.logger = new Logger(this.constructor.name);
    }

    async exec(params: HandleCallbackParams): Promise<IntegrationAuth> {
        return this.runTransaction(async (manager) => {
            const { integrationKey } = params;
            this.logger.log(`Handling callback for integration ${params.integrationKey}`);

            const txIntegrationAuthService = this.integrationAuthService.withTransaction(manager);
            const txIntegrationService = this.integrationService.withTransaction(manager);

            this.logger.log(`Retrieving integration ${integrationKey}`);
            const integration = await txIntegrationService.retrieve(integrationKey);
            this.logger.log(`Integration retrieved`, integration);

            this.logger.log(`Resolving integration ${integration.key}`);
            await this.integrationFactory.resolveIntegration(integration.key);
            this.logger.log(`Integration resolved`);

            this.logger.log(`Building redirect url`);
            const finalRedirectUrl = await this.buildRedirectUrl(integration);
            this.logger.log(`Redirect url built`, finalRedirectUrl);

            this.logger.log(`Executing callback`);
            const callbackResponse: CallbackResponse =
                await this.integrationFactory.callback(finalRedirectUrl);
            this.logger.log(`Callback executed`, callbackResponse);

            this.logger.log(`Finding integration auth`);
            let [error, integrationAuth] = await tryCatch(
                txIntegrationAuthService.findByIntegrationKeyAndUserId(
                    integration.key,
                    callbackResponse.userId,
                ),
            );

            if (error) {
                this.logger.warn(`Error finding integration auth`);
                if (error instanceof Exception && error.type === ErrorTypes.ENTITY_NOT_FOUND) {
                    this.logger.log(`Integration auth not found, creating new one`);
                    integrationAuth = null;
                } else {
                    this.logger.error(`Error finding integration auth`, error);
                    throw error;
                }
            }

            if (integrationAuth) {
                this.logger.log(`Integration auth found, updating`);
                integrationAuth = await txIntegrationAuthService.update(integrationAuth.id, {
                    credentials: callbackResponse.credentials,
                    profileImageUrl: callbackResponse.account?.picture,
                    accountId: callbackResponse.account.id,
                });
                this.logger.log(`Integration auth updated`, integrationAuth);
            } else {
                this.logger.log(`Integration auth not found, creating new one`);
                integrationAuth = await txIntegrationAuthService.create({
                    integrationKey: integration.key,
                    userId: callbackResponse.userId,
                    credentials: callbackResponse.credentials,
                    displayName: callbackResponse.account?.name || callbackResponse.account.id,
                    profileImageUrl: callbackResponse.account?.picture,
                    accountId: callbackResponse.account.id,
                });
                this.logger.log(`Integration auth created`, integrationAuth);
            }

            return integrationAuth;
        });
    }

    private async buildRedirectUrl(integration: Integration): Promise<string> {
        const baseUrl = this.configService.getOrThrow('BASE_URL');

        return `${baseUrl}/integration-auth/${integration.key}/callback`;
    }
}
