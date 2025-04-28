import { IntegrationAuthService } from '@modules/integration-auth/integration-auth.service';
import { IntegrationFactory } from '@modules/integration-library/integration-tool.factory';
import { HandleRedirectStrategy, HandleRedirectParams, HandleCallbackParams } from './types';
import { Injectable, Logger, Scope } from '@nestjs/common';
import { IntegrationService } from '@modules/integration/integration.service';
import { Transactional } from '@utils/transaction';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { Integration } from '@modules/integration/integration.entity';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.REQUEST })
export class HandleRedirectStrategyImpl extends Transactional implements HandleRedirectStrategy {
    private readonly logger: Logger;
    constructor(
        private readonly integrationService: IntegrationService,
        private readonly integrationFactory: IntegrationFactory,
        @InjectEntityManager() entityManager: EntityManager,
        private readonly configService: ConfigService,
    ) {
        super(entityManager);
        this.logger = new Logger(this.constructor.name);
    }

    async exec(params: HandleRedirectParams): Promise<string> {
        this.logger.log(`Handling redirect for integration ${params.integrationKey}`);
        const { integrationKey } = params;

        this.logger.log(`Retrieving integration ${integrationKey}`);
        const integration: Integration = await this.integrationService.retrieve(integrationKey);
        this.logger.log(`Integration retrieved`, integration);

        this.logger.log(`Resolving integration ${integration.key}`);
        await this.integrationFactory.resolveIntegration(integration.key);
        this.logger.log(`Integration resolved`);

        this.logger.log(`Building redirect url`);
        const finalRedirectUrl = await this.buildRedirectUrl(integration);
        this.logger.log(`Redirect url built`, finalRedirectUrl);

        this.logger.log(`Redirecting to ${finalRedirectUrl}`);
        const redirectUrl = await this.integrationFactory.redirect(finalRedirectUrl);
        this.logger.log(`Redirected to ${redirectUrl}`);

        return redirectUrl;
    }

    private async buildRedirectUrl(integration: Integration): Promise<string> {
        const baseUrl = this.configService.getOrThrow('BASE_URL');

        return `${baseUrl}/integration-auth/${integration.key}/callback`;
    }
}
