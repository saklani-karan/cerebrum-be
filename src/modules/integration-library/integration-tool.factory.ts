import { Inject, Injectable, Logger, Scope } from '@nestjs/common';
import { ContextId, ContextIdFactory, ModuleRef, REQUEST } from '@nestjs/core';
import { ToolDefinitionTemplate } from './types/tool';
import {
    CallbackResponse,
    IntegrationInterface,
    buildIntegrationInjectionToken,
} from './types/integration';
import { Request } from 'express';

@Injectable({ scope: Scope.REQUEST })
export class ToolFactory {
    private tool: ToolDefinitionTemplate;
    private readonly logger: Logger;

    constructor(private moduleRef: ModuleRef) {
        this.logger = new Logger(this.constructor.name);
    }

    async resolveTool(integrationKey: string, toolKey: string): Promise<void> {
        this.logger.log(`Creating tool: ${toolKey}`);
        let resolvedTool: ToolDefinitionTemplate;

        try {
            resolvedTool = await this.moduleRef.resolve(
                ToolDefinitionTemplate.buildInjectionToken(integrationKey, toolKey),
            );
        } catch (error) {
            this.logger.error(`Tool ${toolKey} not found`, error);
            throw new Error(`Tool ${toolKey} not found`);
        }

        this.tool = resolvedTool;
    }

    async execute(params: any) {
        return this.tool.run(params);
    }
}

@Injectable({ scope: Scope.REQUEST })
export class IntegrationFactory {
    private integration: IntegrationInterface;
    private readonly logger: Logger;

    constructor(
        private moduleRef: ModuleRef,
        @Inject(REQUEST) private readonly request: Request,
    ) {
        this.logger = new Logger(this.constructor.name);
    }

    async resolveIntegration(integrationKey: string): Promise<void> {
        this.logger.log(`Creating integration: ${integrationKey}`);

        let resolvedIntegration: IntegrationInterface;
        const contextId: ContextId = ContextIdFactory.getByRequest(this.request);

        try {
            resolvedIntegration = await this.moduleRef.resolve(
                buildIntegrationInjectionToken(integrationKey),
                contextId,
            );
        } catch (error) {
            this.logger.error(`Integration ${integrationKey} not found`, error);
            throw new Error(`Integration ${integrationKey} not found`);
        }

        this.integration = resolvedIntegration;
    }

    async redirect(finalRedirectUrl: string): Promise<string> {
        return this.integration.redirect(finalRedirectUrl);
    }

    async callback(finalRedirectUrl: string): Promise<CallbackResponse> {
        return this.integration.callback(finalRedirectUrl);
    }
}
