import 'reflect-metadata';

export interface IntegrationDefinitionMetadata {
    name: string;
    description: string;
    key: string;
}

export class IntegrationMetadata {
    private static INTEGRATION_DEFINITION_KEY: symbol = Symbol('integration:definition');

    static define(definition: IntegrationDefinitionMetadata) {
        const metadata = {
            name: definition.name,
            description: definition.description,
            key: definition.key,
        };

        return (target: Function) => {
            return Reflect.defineMetadata(
                IntegrationMetadata.INTEGRATION_DEFINITION_KEY,
                metadata,
                target,
            );
        };
    }

    static retrieve(target: any) {
        return Reflect.getMetadata(IntegrationMetadata.INTEGRATION_DEFINITION_KEY, target);
    }
}
