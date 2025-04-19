import { Injectable, Logger, Provider, Scope } from '@nestjs/common';
import { IntegrationExecutable } from './types';
import { ModuleRef } from '@nestjs/core';
import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { IntegrationMetadata } from './decorators';

@Injectable({ scope: Scope.REQUEST })
export class IntegrationFactory {
    private integration: IntegrationExecutable;
    private readonly logger: Logger;

    constructor(private moduleRef: ModuleRef) {
        this.logger = new Logger(this.constructor.name);
    }

    async createIntegration(key: string): Promise<void> {
        this.logger.log(`Creating integration: ${key}`);
        let resolvedIntegration: IntegrationExecutable;

        try {
            resolvedIntegration = await this.moduleRef.resolve(
                IntegrationFactory.buildIntegrationInjectionToken(key),
            );
        } catch (error) {
            this.logger.error(`Integration ${key} not found`, error);
            throw new Error(`Integration ${key} not found`);
        }

        this.integration = resolvedIntegration;
    }

    async execute(action: string, params: any) {
        return this.integration.execute(action, params);
    }

    static injectIntegrations(): Provider[] {
        const logger = new Logger(IntegrationFactory.name);
        logger.log('Injecting integrations');
        const directory = join(__dirname, 'lib');
        logger.log(`Scanning directory: ${directory}`);
        const integrations: any[] = [];
        const providers: Provider[] = [];

        const scanDirectory = (dir: string) => {
            const files = readdirSync(dir);
            files.forEach((file) => {
                const filePath = join(dir, file);
                const stats = statSync(filePath);
                if (stats.isDirectory()) {
                    scanDirectory(filePath);
                    return;
                }

                if (file.endsWith('.js') && !file.endsWith('.map.js')) {
                    const integrationClass = require(`${filePath}`).default;

                    if (IntegrationFactory.isIntegrationExecutable(integrationClass)) {
                        integrations.push(integrationClass);
                    }
                }
            });
        };

        scanDirectory(directory);

        logger.log(`Found ${integrations.length} integrations`);

        integrations.forEach((integration) => {
            const metadata = IntegrationMetadata.retrieve(integration);

            if (metadata) {
                logger.log(`Integration: ${metadata?.key}`);
                providers.push({
                    provide: IntegrationFactory.buildIntegrationInjectionToken(metadata.key),
                    useClass: integration,
                    scope: Scope.REQUEST,
                });
            }
        });

        return providers;
    }

    private static isIntegrationExecutable(integrationClass: any) {
        return (
            integrationClass &&
            (Object.getPrototypeOf(integrationClass) === IntegrationExecutable ||
                integrationClass.prototype instanceof IntegrationExecutable ||
                (IntegrationExecutable.isPrototypeOf &&
                    IntegrationExecutable.isPrototypeOf(integrationClass)))
        );
    }

    private static buildIntegrationInjectionToken(key: string) {
        return `injection_token:${key}`;
    }
}
