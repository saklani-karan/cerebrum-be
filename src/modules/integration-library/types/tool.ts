import { IntegrationInterface } from './integration';
import { Logger } from '@nestjs/common';
import { ErrorTypes, ValidationError } from '@utils/exceptions';
import { ZodError, z } from 'zod';
import { throwException } from '@utils/exceptions';
import { ToolDefinitionMetadata, ToolMetadata } from '../decorators';
import { IntegrationCredentials } from '@modules/integration-auth/integration-auth.entity';

export interface ExecutableToolInterface<
    TInput extends Record<string, any> = Record<string, any>,
    TOutput extends Record<string, any> = Record<string, any>,
> {
    run(params: TInput): Promise<TOutput>;
    initialize(credentials: IntegrationCredentials): void;
}

export abstract class ToolDefinitionTemplate<
    TInput extends Record<string, any> = Record<string, any>,
    TOutput extends Record<string, any> = Record<string, any>,
> implements ExecutableToolInterface<TInput, TOutput>
{
    protected integration: IntegrationInterface;
    protected logger: Logger;

    constructor(integration: IntegrationInterface) {
        this.integration = integration;
        this.logger = new Logger(this.constructor.name);
    }

    initialize(credentials: IntegrationCredentials): void {
        this.integration.setCredentials(credentials);
    }

    protected abstract execute(
        params: TInput,
        credentials: IntegrationCredentials,
    ): Promise<TOutput>;

    async run(params: TInput): Promise<TOutput> {
        const validatedParams = this.validateParams(params);

        const credentials = await this.integration.authenticate();

        return this.execute(validatedParams, credentials);
    }

    private validateParams<Input extends Record<string, any>>(params: Input): Input {
        const metadata: ToolDefinitionMetadata = ToolMetadata.retrieve(this.constructor);
        const schema = metadata.params;
        let validatedParams: Input;

        try {
            validatedParams = schema.parse(params);
        } catch (error) {
            if (error instanceof ZodError) {
                throwException(ErrorTypes.INVALID_ARGUMENTS, {
                    message: 'Invalid parameters received from request',
                    validationErrors: this.transformValidationErrors(error),
                });
            }
            throw error;
        }

        return validatedParams;
    }

    private transformValidationErrors(error: ZodError): ValidationError[] {
        const validationErrors: ValidationError[] = [];
        error.errors.forEach((error) => {
            validationErrors.push({
                path: error.path.join('.'),
                errors: [error.message],
            });
        });
        return validationErrors;
    }

    static buildInjectionToken(integrationKey: string, toolKey: string): string {
        return `tool:${integrationKey}.${toolKey}`;
    }
}
