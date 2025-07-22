import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { ExecuteToolRequest, ToolExecutionStrategy } from './types';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { IntegrationAuthService } from '@modules/integration-auth/integration-auth.service';
import { IntegrationAuth } from '@modules/integration-auth/integration-auth.entity';
import { ErrorTypes, throwException } from '@utils/exceptions';
import { ToolFactory } from '@modules/integration-library/integration-tool.factory';
import { tryCatch } from '@utils/try-catch';

@Injectable({ scope: Scope.REQUEST })
export class ToolExecutionStrategyImpl implements ToolExecutionStrategy {
    private logger: Logger;

    constructor(
        @Inject(REQUEST) private readonly request: Request,
        private readonly integrationAuthService: IntegrationAuthService,
        private readonly toolFactory: ToolFactory,
    ) {
        this.logger = new Logger(this.constructor.name);
    }

    async execute(request: ExecuteToolRequest<Record<string, any>>): Promise<Record<string, any>> {
        this.logger.log('execute: received request to begin tool execution');
        const { integrationKey, params, toolKey } = request;

        this.logger.log(
            `execute: integrationKey = ${integrationKey} and toolKey = ${toolKey} to begin execution. Resolving integration auth`,
        );

        const integrationAuth: IntegrationAuth =
            await this.integrationAuthService.findByIntegrationKeyAndUserId(
                integrationKey,
                this.request.user.id,
            );
        this.logger.log(`execute: successfully resolved integration auth ${integrationAuth.id}`);

        if (!integrationAuth?.credentials) {
            this.logger.error('execute: credentials missing from integration auth setup');
            throwException(ErrorTypes.INVALID_ARGUMENTS, {
                message: 'Integration authentication setup does not have credentials',
            });
        }

        try {
            await this.toolFactory.resolveTool(
                integrationKey,
                toolKey,
                integrationAuth.credentials,
            );
        } catch (err) {
            this.logger.error('execute: an error occurred while resolving tool for execution', err);
            throwException(err);
        }

        this.logger.log('execute: successfully resolved tool for integration key and tool key');

        const [error, response] = await tryCatch(this.toolFactory.execute(params));

        if (error) {
            this.logger.log(
                'execute: an error occurred while executing the tool with the credentials and content',
            );
            throwException(error);
        }
        this.logger.log('execute: successfully executed the tool');

        return response;
    }
}
