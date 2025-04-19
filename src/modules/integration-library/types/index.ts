import { ToolDefinitionMetadata, ToolMetadata } from '../decorators';
import { Logger } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { throwException, ValidationError, ErrorTypes } from '@utils/exceptions';

export class IntegrationExecutable {
    protected logger: Logger;

    constructor() {
        this.logger = new Logger(this.constructor.name);
    }

    async execute<T extends Record<string, any>>(action: string, params: T): Promise<any> {
        this.logger.log(
            `Executing action ${action} with params ${JSON.stringify(params)} in ${this.constructor.name}`,
        );
        const toolDefinitions = ToolMetadata.retrieve(this);

        if (!toolDefinitions?.length) {
            this.logger.error('No tool definitions found');
            throw new Error('No tool definitions found');
        }
        this.logger.log(`Tool definitions found ${toolDefinitions.length}`);

        const toolDefinition: ToolDefinitionMetadata | undefined = toolDefinitions.find(
            (tool) => tool.key === action,
        );

        if (!toolDefinition || typeof this[toolDefinition.key] !== 'function') {
            this.logger.error(`Tool ${action} not found in class ${this.constructor.name}`);
            throw new Error(`Tool ${action} not found in class ${this.constructor.name}`);
        }
        this.logger.log(`Tool definition found ${toolDefinition.key}`);

        return this[toolDefinition.key](params);
    }
}
