import { Injectable, Logger, Scope } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { ToolDefinitionTemplate } from './types/tool';

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
