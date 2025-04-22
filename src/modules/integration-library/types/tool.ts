import { IntegrationAuthenticationCredentials, IntegrationInterface } from './integration';
import { Logger } from '@nestjs/common';
import { ErrorTypes, ValidationError } from '@utils/exceptions';
import { ZodError, z } from 'zod';
import { throwException } from '@utils/exceptions';
import { ToolDefinitionMetadata, ToolMetadata } from '../decorators';

export abstract class ToolDefinitionTemplate<
    TInput extends Record<string, any> = Record<string, any>,
    TOutput extends Record<string, any> = Record<string, any>,
    AuthenticationCredentials extends
        IntegrationAuthenticationCredentials = IntegrationAuthenticationCredentials,
> {
    protected integration: IntegrationInterface<AuthenticationCredentials>;
    protected credentials: AuthenticationCredentials;
    protected logger: Logger;

    constructor(integration: IntegrationInterface<AuthenticationCredentials>) {
        this.integration = integration;
        this.logger = new Logger(this.constructor.name);
    }

    protected async authenticate() {
        this.credentials = await this.integration.authenticate();
    }

    protected abstract execute(params: TInput): Promise<TOutput>;

    async run(params: TInput): Promise<TOutput> {
        const validatedParams = this.validateParams(params);

        await this.authenticate();

        return this.execute(validatedParams);
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
