import { AbstractSeederService } from '../../types';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Integration } from '@modules/integration/integration.entity';
import {
    IntegrationDefinitionMetadata,
    IntegrationMetadata,
    ToolDefinitionMetadata,
    ToolMetadata,
} from '@modules/integration-library/decorators';
import { z } from 'zod';
import { IntegrationService } from '@modules/integration/integration.service';
import { ToolService } from '@modules/tool/tool.service';
import { Tool } from '@modules/tool/tool.entity';
import { CreateIntegration } from '@modules/integration/types/create-integration';
import { UpdateManyIntegrationRequest } from '@modules/integration/types/update-many-integrations';
import { CreateTool } from '@modules/tool/types/create-tool';
import { UpdateManyToolsRequest } from '@modules/tool/types/update-many-tools';
import { ScanDirectoryStrategyBuilder } from '@utils/scan-directory';
import { join } from 'path';
import { SeederIntegrationFilterExtension } from './directory-scanner/integration/filter-extension';
import { SeederIntegrationFilterClassReducer } from './directory-scanner/integration/filter-class-reducer';
import { SeederToolFilterExtension } from './directory-scanner/tool/filter-extension';
import {
    SeederToolFilterClassReducer,
    ToolDefinitionMetadataWithIntegrationReference,
} from './directory-scanner/tool/filter-class-reducer';

interface Tools {
    key: string;
    name: string;
    description: string;
    params: z.ZodType<any>;
}

interface IntegrationWithTools {
    key: string;
    name: string;
    description: string;
    tools: Tools[];
}

export default class IntegrationAndToolSeeder extends AbstractSeederService {
    constructor(
        @InjectEntityManager() manager: EntityManager,
        private readonly integrationService: IntegrationService,
        private readonly toolService: ToolService,
    ) {
        super(manager);
    }

    async isSeedingRequired(): Promise<boolean> {
        return true;
    }

    async seed(): Promise<void> {
        return this.runTransaction(async (manager) => {
            this.logger.log(`seed: Seeding integrations and tools`);

            const integrationMetadata: IntegrationDefinitionMetadata[] =
                this.retrieveIntegrationMetadata();
            this.logger.log(`seed: Found ${integrationMetadata.length} integrations`);

            const toolMetadata: ToolDefinitionMetadataWithIntegrationReference[] =
                this.retrieveToolMetadata();
            this.logger.log(`seed: Found ${toolMetadata.length} tools`);

            const txIntegrationService = this.integrationService.withTransaction(manager);
            const txToolService = this.toolService.withTransaction(manager);

            const integrationQueryKeys = integrationMetadata.map((integration) => integration.key);
            this.logger.log(`seed: Found ${integrationQueryKeys.length} integration query keys`);
            const toolsQueryKeys = toolMetadata.map((tool) => tool.key);
            this.logger.log(`seed: Found ${toolsQueryKeys.length} tool query keys`);

            const [existingIntegrations, existingTools] = await Promise.all([
                txIntegrationService.findByKeys(integrationQueryKeys),
                txToolService.findAllByKeyAndAction(integrationQueryKeys, toolsQueryKeys),
            ]);
            this.logger.log(`seed: Found ${existingIntegrations.length} existing integrations`);
            this.logger.log(`seed: Found ${existingTools.length} existing tools`);

            const integrationMap = new Map<string, Integration>();
            const toolMap = new Map<string, Tool>();
            existingIntegrations.forEach((integration) => {
                integrationMap.set(integration.key, integration);
            });
            existingTools.forEach((tool) => {
                toolMap.set(`${tool.integrationKey}-${tool.action}`, tool);
            });
            this.logger.log(`seed: Found ${integrationMap.size} integration map entries`);
            this.logger.log(`seed: Found ${toolMap.size} tool map entries`);

            const toUpdateIntegrations: UpdateManyIntegrationRequest = {};
            const toCreateIntegrations: CreateIntegration[] = [];
            const toUpdateTools: UpdateManyToolsRequest = {};
            const toCreateTools: CreateTool[] = [];

            integrationMetadata.forEach((integration) => {
                this.determineActionForIntegration(
                    toUpdateIntegrations,
                    toCreateIntegrations,
                    integration,
                    integrationMap,
                );
            });

            toolMetadata.forEach((tool) => {
                this.determineActionForTool(toUpdateTools, toCreateTools, tool, toolMap);
            });

            this.logger.log(`seed: Creating ${toCreateIntegrations.length} integrations`);
            this.logger.log(
                `seed: Updating ${Object.keys(toUpdateIntegrations).length} integrations`,
            );
            const [createdIntegrations, updatedIntegrations] = await Promise.all([
                txIntegrationService.createMany(toCreateIntegrations),
                txIntegrationService.updateMany(toUpdateIntegrations),
            ]);
            this.logger.log(`seed: Created ${createdIntegrations.length} integrations`);
            this.logger.log(`seed: Updated ${updatedIntegrations.length} integrations`);

            this.logger.log(`seed: Creating ${toCreateTools.length} tools`);
            this.logger.log(`seed: Updating ${Object.keys(toUpdateTools).length} tools`);
            const [createdTools, updatedTools] = await Promise.all([
                txToolService.createMany(toCreateTools),
                txToolService.updateMany(toUpdateTools),
            ]);
            this.logger.log(`seed: Created ${createdTools.length} tools`);
            this.logger.log(`seed: Updated ${updatedTools.length} tools`);
        });
    }

    private retrieveIntegrationMetadata(): IntegrationDefinitionMetadata[] {
        const directoryScanner = new ScanDirectoryStrategyBuilder<IntegrationDefinitionMetadata>()
            .filterFileExtension(new SeederIntegrationFilterExtension())
            .filteredClassReducer(new SeederIntegrationFilterClassReducer())
            .build();

        const integrations = directoryScanner.scan(
            join(process.cwd(), 'dist', 'modules', 'integration-library', 'lib'),
        );
        return integrations;
    }

    private retrieveToolMetadata(): ToolDefinitionMetadataWithIntegrationReference[] {
        const directoryScanner =
            new ScanDirectoryStrategyBuilder<ToolDefinitionMetadataWithIntegrationReference>()
                .filterFileExtension(new SeederToolFilterExtension())
                .filteredClassReducer(new SeederToolFilterClassReducer())
                .build();

        const tools = directoryScanner.scan(
            join(process.cwd(), 'dist', 'modules', 'integration-library', 'lib'),
        );
        return tools;
    }

    private determineActionForTool(
        toUpdate: UpdateManyToolsRequest,
        toCreate: CreateTool[],
        systemTool: ToolDefinitionMetadataWithIntegrationReference,
        toolMap: Map<string, Tool>,
    ) {
        this.logger.log(`determineActionForTool: Determining action for tool ${systemTool.key}`);
        const { key, name, description, params, integrationReference: integrationKey } = systemTool;

        if (!toolMap.has(`${integrationKey}-${key}`)) {
            this.logger.log(`determineActionForTool: Tool ${systemTool.key} not found, creating`);
            toCreate.push({
                integrationKey,
                action: key,
                name,
                description,
                userParams: params,
                workflowParams: params,
            });
            this.logger.log(`determineActionForTool: Tool ${systemTool.key} created`);
            return;
        }

        const tool = toolMap.get(`${integrationKey}-${key}`);
        this.logger.log(`determineActionForTool: Tool ${systemTool.key} found, updating`);
        let isUpdated = false;
        if (tool.name !== name) {
            tool.name = name;
            isUpdated = true;
        }
        if (tool.description !== description) {
            tool.description = description;
            isUpdated = true;
        }

        if (!isUpdated) {
            this.logger.log(`determineActionForTool: Tool ${systemTool.key} not updated`);
            return;
        }
        this.logger.log(`determineActionForTool: Tool ${systemTool.key} updated`);

        toUpdate[`${integrationKey}-${key}`] = {
            name: tool.name,
            description: tool.description,
            userParams: tool.userParams,
            workflowParams: tool.workflowParams,
        };
    }

    private determineActionForIntegration(
        toUpdate: UpdateManyIntegrationRequest,
        toCreate: CreateIntegration[],
        systemIntegration: IntegrationDefinitionMetadata,
        integrationMap: Map<string, Integration>,
    ) {
        const { key, name, description } = systemIntegration;
        this.logger.log(`determineActionForIntegration: Integration ${key} not found, creating`);
        if (!integrationMap.has(key)) {
            toCreate.push({
                key,
                name,
                description,
            });
            this.logger.log(`determineActionForIntegration: Integration ${key} created`);
            return;
        }

        const integration = integrationMap.get(key);
        this.logger.log(`determineActionForIntegration: Integration ${key} found, updating`);
        let isUpdated = false;
        if (integration.name !== name) {
            integration.name = name;
            isUpdated = true;
        }
        if (integration.description !== description) {
            integration.description = description;
            isUpdated = true;
        }

        if (!isUpdated) {
            this.logger.log(`determineActionForIntegration: Integration ${key} not updated`);
            return;
        }
        this.logger.log(`determineActionForIntegration: Integration ${key} updated`);

        toUpdate[key] = {
            name: integration.name,
            description: integration.description,
        };
    }
}
