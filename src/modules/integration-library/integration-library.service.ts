import { Injectable, Scope } from '@nestjs/common';
import { ToolFactory } from './integration-tool.factory';

@Injectable({ scope: Scope.REQUEST })
export class IntegrationLibraryService {
    constructor(private readonly toolFactory: ToolFactory) {}

    async execute(integrationKey: string, toolKey: string, params: any) {
        await this.toolFactory.resolveTool(integrationKey, toolKey);
        return this.toolFactory.execute(params);
    }
}
