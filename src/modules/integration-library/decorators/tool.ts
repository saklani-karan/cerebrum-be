import { ErrorTypes, ValidationError } from '@utils/exceptions';
import { throwException } from '@utils/exceptions';
import { IntegrationMetadata } from './integration';
import { z, ZodError } from 'zod';

export type infer<T extends z.ZodType<any, any, any>> = z.infer<T>;

export interface ToolDefinitionMetadata {
    description: string;
    params: z.ZodType<any>;
    name: string;
    key: string;
}

export interface DefineSchemaOptions<Schema extends z.ZodType<any, any, any>> {
    name: string;
    description: string;
    schema: Schema;
}

export class ToolMetadata {
    private static TOOL_DEFINITION_KEY: symbol = Symbol('tool:definitions');

    static define<Schema extends z.ZodType<any, any, any>>({
        name,
        description,
        schema,
    }: DefineSchemaOptions<Schema>) {
        return <T extends (arg: z.infer<Schema>) => void>(
            target: any,
            propertyKey: string | symbol,
            descriptor: TypedPropertyDescriptor<T>,
        ) => {
            const definition: ToolDefinitionMetadata = {
                description,
                params: schema,
                name,
                key: propertyKey as string,
            };
            const originalMethod = descriptor.value;

            descriptor.value = function (this: any, params: any) {
                const validatedParams: z.infer<Schema> = ToolMetadata.validateParams(
                    params,
                    schema,
                );
                return originalMethod.call(this, validatedParams);
            } as any;

            const toolDefinitions: ToolDefinitionMetadata[] =
                Reflect.getMetadata(ToolMetadata.TOOL_DEFINITION_KEY, target) || [];

            toolDefinitions.push({
                ...definition,
            });

            return Reflect.defineMetadata(
                ToolMetadata.TOOL_DEFINITION_KEY,
                toolDefinitions,
                target,
            );
        };
    }

    static retrieve(target: any): ToolDefinitionMetadata[] {
        return Reflect.getMetadata(ToolMetadata.TOOL_DEFINITION_KEY, target);
    }

    private static validateParams<
        Input extends Record<string, any>,
        Output extends Record<string, any>,
    >(params: Input, schema: z.ZodSchema<Output>): Output {
        let validatedParams: Output;

        try {
            validatedParams = schema.parse(params);
        } catch (error) {
            if (error instanceof ZodError) {
                throwException(ErrorTypes.INVALID_ARGUMENTS, {
                    message: 'Invalid parameters received from request',
                    validationErrors: ToolMetadata.transformValidationErrors(error),
                });
            }
            throw error;
        }

        return validatedParams;
    }

    private static transformValidationErrors(error: ZodError): ValidationError[] {
        const validationErrors: ValidationError[] = [];
        error.errors.forEach((error) => {
            validationErrors.push({
                path: error.path.join('.'),
                errors: [error.message],
            });
        });
        return validationErrors;
    }
}
