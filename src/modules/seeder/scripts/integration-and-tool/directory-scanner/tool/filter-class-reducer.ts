import {
    ToolMetadata,
    ToolDefinitionMetadata,
    IntegrationReference,
} from '@modules/integration-library/decorators';
import { FilteredClassReducerInterface } from '@utils/scan-directory';

export interface ToolDefinitionMetadataWithIntegrationReference extends ToolDefinitionMetadata {
    integrationReference: string;
}

export class SeederToolFilterClassReducer
    implements FilteredClassReducerInterface<ToolDefinitionMetadataWithIntegrationReference>
{
    exec(
        exports: any,
        aggregator: ToolDefinitionMetadataWithIntegrationReference[],
    ): ToolDefinitionMetadataWithIntegrationReference[] {
        if (!exports.default) {
            return aggregator;
        }

        const toolClass = exports.default;

        const metadata: ToolDefinitionMetadata = ToolMetadata.retrieve(toolClass);
        const integrationReference: string = IntegrationReference.retrieve(toolClass);
        if (!metadata || !integrationReference) {
            return aggregator;
        }

        aggregator.push({
            ...metadata,
            integrationReference,
        });
        return aggregator;
    }
}
