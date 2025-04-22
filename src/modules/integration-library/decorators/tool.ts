import { z } from 'zod';
import { IntegrationMetadata } from './integration';
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
    key: string;
}

export class IntegrationReference {
    private static INTEGRATION_REFERENCE_KEY: symbol = Symbol('integration:reference');

    static define(integrationResolver: () => any) {
        return (target: any, propertyKey: string | symbol) => {
            console.log('IntegrationReference', target, propertyKey);
            const integration = integrationResolver();

            const integrationDefinition = IntegrationMetadata.retrieve(integration);
            if (!integrationDefinition) {
                throw new Error(
                    `Integration not found on target ${target} and property ${propertyKey.toString()}`,
                );
            }

            return Reflect.defineMetadata(
                IntegrationReference.INTEGRATION_REFERENCE_KEY,
                integrationDefinition.key,
                target.constructor,
            );
        };
    }

    static retrieve(target: any): string {
        const integrationReference = Reflect.getMetadata(
            IntegrationReference.INTEGRATION_REFERENCE_KEY,
            target,
        );
        if (!integrationReference) {
            throw new Error(`Integration reference not found on target ${target}`);
        }
        return integrationReference;
    }
}

export class ToolMetadata {
    private static TOOL_DEFINITION_KEY: symbol = Symbol('tool:definitions');

    static define<Schema extends z.ZodType<any, any, any>>({
        name,
        description,
        schema,
        key,
    }: DefineSchemaOptions<Schema>) {
        return (target: any) => {
            const definition: ToolDefinitionMetadata = {
                description,
                params: schema,
                name,
                key,
            };

            return Reflect.defineMetadata(ToolMetadata.TOOL_DEFINITION_KEY, definition, target);
        };
    }

    static retrieve(target: any): ToolDefinitionMetadata {
        const toolDefinitions = Reflect.getMetadata(ToolMetadata.TOOL_DEFINITION_KEY, target);
        if (!toolDefinitions) {
            throw new Error(`Tool definitions not found on target ${target}`);
        }
        return toolDefinitions;
    }
}
