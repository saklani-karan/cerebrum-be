import { Injectable, Scope } from '@nestjs/common';
import { IntegrationFactory } from './factory';

@Injectable({ scope: Scope.REQUEST })
export class IntegrationLibraryService {
    constructor(private readonly integrationFactory: IntegrationFactory) {}

    async execute(key: string, action: string, params: any) {
        await this.integrationFactory.createIntegration(key);
        return this.integrationFactory.execute(action, params);
    }
}
